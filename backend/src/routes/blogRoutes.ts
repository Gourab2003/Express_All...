import express from 'express';
import BlogController from '../controllers/blogController';
import { authenticate } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { CreatePostSchema, UpdatePostSchema, CommentInputSchema } from '../interfaces/IBlog'

const router = express.Router();

/**
 * @route GET /api/v1/blog/posts
 * @desc Get all published posts with pagination
 * @access Public
 */

router.get('/posts', BlogController.getAllPosts);

/**
 * @route GET /api/v1/blog/posts/:slug
 * @desc Get a single post by slug
 * @access Public
 */

router.get('/posts/:slug', BlogController.getPostBySlug);


/**
 * @route POST /api/v1/blog/posts
 * @desc Create a new blog post
 * @access Private (Authenticated)
 */

router.post(
    '/posts',
    authenticate,
    validateRequest(CreatePostSchema),
    BlogController.createPost
);

/**
 * @route PUT /api/v1/blog/posts/:id
 * @desc Update an existing blog post
 * @access Private (Authenticated, Author only)
 */

router.put(
    '/posts/:id',
    authenticate,
    validateRequest(UpdatePostSchema),
    BlogController.updatePost
);

/**
 * @route DELETE /api/v1/blog/posts/:id
 * @desc Delete a blog post
 * @access Private (Authenticated, Author only)
 */

router.delete(
    '/posts/:id',
    authenticate,
    BlogController.deletePost
);

/**
 * @route POST /api/v1/blog/posts/:id/like
 * @desc Like a blog post
 * @access Private (Authenticated)
 */

router.post(
    '/posts/:id/like',
    authenticate,
    BlogController.likePost
);

/**
 * @route POST /api/v1/blog/posts/:id/unlike
 * @desc Unlike a blog post
 * @access Private (Authenticated)
 */

router.post(
    '/posts/:id/unlike',
    authenticate, 
    BlogController.unlikePost
);

/**
 * @route POST /api/v1/blog/posts/:id/comment
 * @desc Add a comment to a blog post
 * @access Private (Authenticated)
 */

router.post(
    '/posts/:id/comment',
    authenticate,
    validateRequest(CommentInputSchema),
    BlogController.addComment
)

export default router;