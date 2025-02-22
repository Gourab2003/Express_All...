import { z } from 'zod';
import { Types } from 'mongoose';

/**
 * Custom Zod validation for MongoDB ObjectId
 */
const ObjectId = z.string().refine(
    (val) => Types.ObjectId.isValid(val),
    (val) => ({ message: `Invalid MongoDb ObjectId: ${val}` })
)

/**
 * Schema for a single comment on a post
 */

export const CommentSchema = z.object({
    user: z.string(),
    content: z.string()
        .min(1, "Comment cannot be empty")
        .max(1000, "Comment is too long"),
    createdAt: z.date().optional()
});

/**
 * Schema for post metadata (e.g., views, shares)
 */

export const MetaSchema = z.object({
    views: z.number().int().nonnegative().default(0),
    shares: z.number().int().nonnegative().default(0)
});

/**
 * Schema for a blog post
 */
export const PostSchema = z.object({
    title: z.string()
        .min(3, 'Title must be at least 3 characters')
        .max(100, 'Title  cannot exceed 100 characters'),
    content: z.string().min(10, 'Content must be at least 10 characters'),
    author: z.instanceof(Types.ObjectId),  // Change from Types.ObjectId to z.instanceof
    slug: z.string().optional(),
    tags: z.array(z.string().min(1).max(20)).default(() => []),
    status: z.enum(['Draft', 'Published']).default("Draft"),
    featuredImage: z.string().url().regex(/^https?:\/\/.+\.(jpg|jpeg|png|gif)$/, "Must be a valid image URL").optional(), excerpt: z.string().max(200, 'Excerpt cannot exceed 200 characters').optional(),
    readingTime: z.number().int().nonnegative().optional(),
    likes: z.array(z.instanceof(Types.ObjectId)).default([]),
    comments: z.array(CommentSchema).default([]),
    meta: z.object({
        views: z.number().int().nonnegative().default(0),
        shares: z.number().int().nonnegative().default(0)
    }).optional(),
    viewedBy: z.array(z.instanceof(Types.ObjectId)).default([]),
});



/**
 * Schema for creating a new post (excludes fields managed by the system)
 */

export const CreatePostSchema = z.object({
    title: z.string()
        .min(3, 'Title must be at least 3 characters')
        .max(100, 'Title cannot exceed 100 characters'),
    content: z.string()
        .min(10, 'Content must be at least 10 characters'),
    tags: z.array(z.string().min(1).max(20)).default(() => []),
    status: z.enum(['Draft', 'Published']).default("Draft"),
    featuredImage: z.string().url().regex(/^https?:\/\/.+\.(jpg|jpeg|png|gif)$/, "Must be a valid image URL").optional()
});


/**
 * Schema for updating an existing post (all fields optional)
 */

export const UpdatePostSchema = CreatePostSchema.partial();

export const CommentInputSchema = CommentSchema.omit({
    user: true,
    createdAt: true
});

export const PostResponseSchema = PostSchema.extend({
    _id: ObjectId,
    createdAt: z.date(),
    updatedAt: z.date()
});

export type IComment = z.infer<typeof CommentSchema>;
export type IMeta = z.infer<typeof MetaSchema>;
export type IPost = z.infer<typeof PostSchema>;
export type ICreatePost = z.infer<typeof CreatePostSchema>;
export type IUpdatePost = z.infer<typeof UpdatePostSchema>;
export type IcommentInput = z.infer<typeof CommentInputSchema>;
export type IPostResponse = z.infer<typeof PostResponseSchema>