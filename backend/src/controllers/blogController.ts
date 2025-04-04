import { redis } from "./../lib/redis";
import { createResponse, HttpStatus } from "./../utils/responseFormatter";
import { Request, Response } from "express";
import Post from "../models/Blog.Schema";
import { CreatePostSchema, UpdatePostSchema, CommentInputSchema } from "../interfaces/IBlog";
import { asyncHandler, APIError } from "../utils/errorHandler";
import { logger } from "../utils/logger";
import { Types } from "mongoose";


class BlogController {

    /**
     * Create a new blog post
     */

    static createPost = asyncHandler(async (req: Request, res: Response) => {
        const { user } = req;
        if (!user) throw new APIError('Authentication required', HttpStatus.UNAUTHORIZED);

        //Validate request body
        const validatedData = CreatePostSchema.parse(req.body);

        const authorId = new Types.ObjectId(user.id);

        const post = await Post.create({
            ...validatedData,
            author: authorId
        });

        logger.info(`Post created with ID: ${post._id} by user: ${user.id}`);

        return createResponse(res, HttpStatus.CREATED, 'Post created successfully', post);
    });

    /**
     * Update a blog post
     */

    static updatePost = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { user } = req;
        if (!user) throw new APIError('Authentication required', HttpStatus.UNAUTHORIZED);
        const post = await Post.findById(id);
        if (!post) {
            throw new APIError('Post not found', HttpStatus.NOT_FOUND);
        };

        //check if user is auther
        if (!post.isAuthor(user.id)) throw new APIError('Not authorized', HttpStatus.UNAUTHORIZED);

        const validatedData = UpdatePostSchema.parse(req.body);

        const updatedPost = await Post.findByIdAndUpdate(
            id,
            validatedData,
            { new: true, runValidators: true }
        );

        logger.info(`Post ${id} updated by user: ${user.id}`);

        return createResponse(res, HttpStatus.OK, 'Post updated successfully', updatedPost);
    });


    /*
     * Delete a blog post
     */

    static deletePost = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { user } = req;
        if (!user) throw new APIError('Authentication required', HttpStatus.UNAUTHORIZED);

        const post = await Post.findById(id);
        if (!post) {
            throw new APIError('Post not found', HttpStatus.NOT_FOUND);
        };

        if (!post.isAuthor(user.id)) throw new APIError('Not authorized', HttpStatus.FORBIDDEN);

        await post.deleteOne();
        logger.info(`Post ${id} deleted by user:${user.id}`);

        return createResponse(res, HttpStatus.OK, 'Post deleted successfully');
    });

    /**
     * Get all blog posts
     */

    static getAllPosts = asyncHandler(async (req: Request, res: Response) => {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
        const status = (req.query.status as string) || 'Published';
        const skip = (page - 1) * limit;
        const cacheKey = `posts:${status}:${page}:${limit}`;

        //!Cache check

        const cached = await redis.get(cacheKey);
        if (cached) {
            logger.debug(`Cache hit for ${cacheKey}`);
            return createResponse(res, HttpStatus.OK, 'Posts fetched successfully', JSON.parse(cached).data, JSON.parse(cached).pagination);
        }

        const [posts, total] = await Promise.all([
            Post.find({ status })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('author', ['name', 'email']),
            Post.countDocuments({ status })
        ]);

        const responseData = {
            data: posts,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total,
                limit
            }
        }

        await redis.setex(cacheKey, 600, JSON.stringify(responseData));
        logger.debug(`Cache set for ${cacheKey}`);

        logger.debug(`Fetched posts`, { page, limit, total });
        return createResponse(res, HttpStatus.OK, 'Posts fetched successfully', posts, responseData.pagination);
    });

    /**
     * Get a single blog post by slug
     */

    static getPostBySlug = asyncHandler(async (req: Request, res: Response) => {
        const { slug } = req.params;
        const { user } = req; // Check for user to track views
        const post = await Post.findBySlug(slug);
        if (!post) throw new APIError('Post not found', HttpStatus.NOT_FOUND);

        // await post.incrementViews(user?.id); // Pass userId if present
        logger.debug(`Fetched post by slug`, { slug });
        return createResponse(res, HttpStatus.OK, 'Post fetched successfully', post);
    });

    static likePost = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { user } = req;

        if (!user) throw new APIError('Authentication required', HttpStatus.UNAUTHORIZED);

        const post = await Post.findById(id);
        if (!post) throw new APIError('Post not found', HttpStatus.NOT_FOUND);

        await post.incrementViews(user.id);

        await post.like(user.id);
        logger.debug(`Post liked`, { postId: id, userId: user.id });
        return createResponse(res, HttpStatus.OK, 'Post liked successfully');
    });

    static unlikePost = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { user } = req;

        if (!user) throw new APIError('Authentication required', HttpStatus.UNAUTHORIZED);

        const post = await Post.findById(id);
        if (!post) throw new APIError('Post not found', HttpStatus.NOT_FOUND);
        await post.unlike(user.id);
        logger.debug(`Post unliked`, { postId: id, userId: user.id });
        return createResponse(res, HttpStatus.OK, 'Post unliked successfully');
    });


    static addComment = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        // const { content } = req.body;
        const { user } = req;
        if (!user) throw new APIError('Authentication required', HttpStatus.UNAUTHORIZED);

        const post = await Post.findById(id);
        if (!post) {
            throw new APIError('Post not found', HttpStatus.NOT_FOUND);
        }

        const validateComment = CommentInputSchema.parse(req.body)
        await post.incrementViews(user.id);
        await post.addComment({
            user: user.id,
            content: validateComment.content
        });

        logger.debug(`Comment added`, { postId: id, userId: user.id });
        return createResponse(res, HttpStatus.CREATED, 'Comment added successfully');
    });
}

export default BlogController;