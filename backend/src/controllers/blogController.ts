import { createResposne, HttpStatus } from "./../utils/responseFormatter";
import { Request, Response } from "express";
import Post from "../models/Blog.Schema";
import { CreatePostSchema, UpdatePostSchema, CommentInputSchema } from "../interfaces/IBlog";
import { asyncHandler, APIError } from "../utils/errorHandler";
import { logger } from "../utils/logger";


class BlogController {

    /**
     * Create a new blog post
     */

    static createPost = asyncHandler(async (req: Request, res: Response) => {
        const { user } = req;
        if (!user) throw new APIError('Authentication required', HttpStatus.UNAUTHORIZED);

        //Validate request body
        const validatedData = CreatePostSchema.parse(req.body);

        const post = await Post.create({
            ...validatedData,
            author: user.id
        });

        logger.info(`Post created with ID: ${post._id} by user: ${user.id}`);

        return createResposne(res, HttpStatus.CREATED, 'Post created successfully', post);
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

        return createResposne(res, HttpStatus.OK, 'Post updated successfully', updatedPost);
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

        return createResposne(res, HttpStatus.OK, 'Post deleted successfully');
    });

    /**
     * Get all blog posts
     */

    static getAllPosts = asyncHandler(async (req: Request, res: Response) => {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
        const status = (req.query.status as string) || 'Published';
        const skip = (page - 1) * limit;

        const [posts, total] = await Promise.all([
            Post.find({ status })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('author', ['name', 'email']),
            Post.countDocuments({ status })
        ]);

        logger.debug(`Fetched posts`, { page, limit, total });
        return createResposne(res, HttpStatus.OK, 'Posts fetched successfully', posts, {
            current: page,
            pages: Math.ceil(total / limit),
            total,
            limit
        });
    });

    /**
     * Get a single blog post by slug
     */

    static getPostBySlug = asyncHandler(async (req: Request, res: Response) => {
        const { slug } = req.params;

        const post = await Post.findBySlug(slug);
        if (!post) {
            throw new APIError("Post not found", HttpStatus.NOT_FOUND);
        };
        await post.incrementViews();
        logger.debug(`Fetched post by slug`, { slug });
        return createResposne(res, HttpStatus.OK, 'Post fetched successfully', post);
    });

    static likePost = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { user } = req;

        if (!user) throw new APIError('Authentication required', HttpStatus.UNAUTHORIZED);

        const post = await Post.findById(id);
        if (!post) throw new APIError('Post not found', HttpStatus.NOT_FOUND);

        await post.like(user.id);
        logger.debug(`Post liked`, { postId: id, userId: user.id });
        return createResposne(res, HttpStatus.OK, 'Post liked successfully');
    });

    static unlikePost = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { user } = req;

        if (!user) throw new APIError('Authentication required', HttpStatus.UNAUTHORIZED);

        const post = await Post.findById(id);
        if (!post) throw new APIError('Post not found', HttpStatus.NOT_FOUND);
        await post.unlike(user.id);
        logger.debug(`Post unliked`, { postId: id, userId: user.id });
        return createResposne(res, HttpStatus.OK, 'Post unliked successfully');
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

        await post.addComment({
            user: user.id,
            content: validateComment.content
        });

        logger.debug(`Comment added`, { postId: id, userId: user.id });
        return createResposne(res, HttpStatus.CREATED, 'Comment added successfully');
    });
}

export default BlogController;