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
        if (!user) throw new APIError('Authentication required', 401);

        //Validate request body
        const validatedData = CreatePostSchema.parse(req.body);

        const post = await Post.create({
            ...validatedData,
            author: user.id
        });

        logger.info(`Post created with ID: ${post._id} by user: ${user.id}`);

        res.status(201).json({
            status: 'success',
            data: post
        });
    });

    /**
     * Update a blog post
     */
    static updatePost = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { user } = req;
        if (!user) throw new APIError('Authentication required', 401);
        const post = await Post.findById(id);
        if (!post) {
            throw new APIError('Post not found', 404);
        };

        //check if user is auther
        if (!post.isAuthor(user.id)) throw new APIError('Not authorized', 403);

        const validatedData = UpdatePostSchema.parse(req.body);

        const updatedPost = await Post.findByIdAndUpdate(
            id,
            validatedData,
            { new: true, runValidators: true }
        );

        logger.info(`Post ${id} updated by user: ${user.id}`);

        res.json({
            status: 'Success',
            data: updatedPost
        });
    });

    static deletePost = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { user } = req;
        if (!user) throw new APIError('Authentication required', 401);

        const post = await Post.findById(id);
        if (!post) {
            throw new APIError('Post not found', 404);
        };

        if (!post.isAuthor(user.id)) throw new APIError('Not authorized', 403);

        await post.deleteOne();
        logger.info(`Post ${id} deleted by user:${user.id}`);

        res.json({
            status: "Success",
            message: 'Post deleted successfully'
        });
    });

    static getAllPosts = asyncHandler(async (req: Request, res: Response) => {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10)); // Cap at 50
        const status = req.query.status as string || 'Published';

        const skip = (page - 1) * limit;

        const post = await Post.find({ status })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('author', 'name email');

        const total = await Post.countDocuments({ status });

        res.json({
            status: "Success",
            data: post,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total
            }
        });
    });


    static getPostBySlug = asyncHandler(async (req: Request, res: Response) => {
        const { slug } = req.params;

        const post = await Post.findBySlug(slug);
        if (!post) {
            throw new APIError("Post not found", 404);
        };
        await post.incrementViews();

        res.json({
            status: 'success',
            data: post
        });
    });

    static likePost = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { user } = req;

        if (!user) throw new APIError('Authentication required', 401);

        const post = await Post.findById(id);

        if (!post) throw new APIError('Post not found', 404);

        await post.like(user.id);

        res.json({
            status: 'Success',
            message: 'Post liked successfully..'
        });
    });

    static unlikePost = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { user } = req;

        if (!user) throw new APIError('Authentication required', 401);

        const post = await Post.findById(id);
        if (!post) throw new APIError('Post not found', 404);
        await post.unlike(user.id);
        res.json({
            status: 'Success',
            message: 'Post unliked successfull'
        });
    });


    static addComment = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        // const { content } = req.body;
        const { user } = req;
        if (!user) throw new APIError('Authentication required', 401);

        const post = await Post.findById(id);
        if (!post) {
            throw new APIError('Post not found', 404);
        }

        const validateComment = CommentInputSchema.parse(req.body)

        await post.addComment({
            user: user.id,
            content: validateComment.content
        });

        res.json({
            status: 'success',
            message: 'Comment added successfully'
        });
    });
}