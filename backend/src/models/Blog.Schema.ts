import mongoose, { Document, Schema, Model, Types } from "mongoose";
import { IPost, IComment, IMeta } from "../interfaces/IBlog"
import slugify from "slugify";
import { addSummarizationJob } from "../lib/queue";

interface IPostDocument extends IPost, Document {
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    addComment(comment: Omit<IComment, 'createdAt'>): Promise<void>;
    incrementViews(): Promise<void>;
    like(userId: string): Promise<void>;
    unlike(userId: string): Promise<void>;
    updateMeta(updates: Partial<IMeta>): Promise<void>;
    isAuthor(userId: string): boolean;
}

interface IPostModel extends Model<IPostDocument> {
    findBySlug(slug: string): Promise<IPostDocument | null>;
    findByAuthor(authorId: string, options?: { status?: string, limit?: number, page?: number }): Promise<IPostDocument>;
    findRelated(postId: string, limit?: number): Promise<IPostDocument>;
}

const commentSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    content: {
        type: String,
        required: true,
        maxLength: 1000
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { _id: true })


const metaSchema = new Schema({
    views: {
        type: Number,
        default: 0,
        min: 0
    },
    shares: {
        type: Number,
        default: 0,
        min: 0
    }
}, { _id: false });

const postSchema = new Schema<IPostDocument>({
    title: {
        type: String,
        required: true,
        trim: true,
        minLength: 3,
        maxLength: 100
    },
    content: {
        type: String,
        required: true,
        minLength: 10
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    slug: {
        type: String,
        unique: true,
        sparse: true
    },
    tags: [{
        type: String,
        trim: true,
        maxLength: 20,
        validate: {
            validator: (v: string) => /^[a-zA-Z0-9-]+$/.test(v),
            message: 'Tags can only contain letters, numbers, and hyphens'
        }
    }],
    status: {
        type: String,
        enum: ['Draft', 'Published'],
        default: 'Draft',
        index: true
    },
    featuredImage: {
        type: String,
        validate: {
            validator: (v: string) => /^https?:\/\/.+/.test(v),
            message: 'Featured image must be a valid URL'
        }
    },
    excerpt: {
        type: String,
        maxLength: 200
    },
    readingTime: {
        type: Number,
        min: 0
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [commentSchema],
    meta: {
        type: metaSchema,
        default: () => ({})
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

postSchema.index({ title: 'text', content: 'text', tags: 'text' });
postSchema.index({ createdAt: -1 });
postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ tags: 1 });

postSchema.pre<IPostDocument>('save', async function (next) {
    postSchema.pre('save', async function (next) {
        try {
            // Explicitly type 'this' as IPostDocument
            const post = this as IPostDocument;

            if (post.isModified('title')) {
                const baseSlug = slugify(post.title, { lower: true, strict: true });
                let slug = baseSlug;
                let counter = 1;

                // Type assertion for the constructor
                const PostModel = post.constructor as Model<IPostDocument>;

                // Check for slug conflicts
                while (await PostModel.findOne({ slug, _id: { $ne: post._id } })) {
                    slug = `${baseSlug}-${counter}`;
                    counter++;
                }
                post.slug = slug;
            }

            if (post.isModified('content')) {
                const wordCount = post.content.split(/\s+/).length;
                post.readingTime = Math.ceil(wordCount / 200);

                // Add summarization job if excerpt is not set
                if (!post.excerpt) {
                    await addSummarizationJob(post._id.toString(), post.content);
                }
            }

            next();
        } catch (error) {
            next(error as Error); // Pass the error to Mongoose
        }
    });
});


postSchema.methods.addComment = async function (comment: Omit<IComment, 'createdAt'>) {
    this.comments.push({ ...comment, createdAt: new Date() });
    await this.save();
};

postSchema.methods.incrementViews = async function () {
    this.meta.views++;
    await this.save();
};

postSchema.methods.like = async function (userId: string) {
    if (!this.likes.includes(userId)) {
        this.likes.push(userId);
        await this.save();
    }
};

postSchema.methods.unlike = async function (userId: string) {
    this.likes = this.likes.filter((id: mongoose.Types.ObjectId) => id.toString() !== userId);
    await this.save();
}

postSchema.methods.updateMeta = async function (updates: Partial<IMeta>) {
    this.meta = { ...this.meta, ...updates };
    await this.save();
}

postSchema.methods.isAuthor = function (userId: string) {
    return this.author.toString() === userId;
};

// Virtuals
postSchema.virtual('likesCount').get(function () {
    return this.likes.length;
});

postSchema.virtual('commentsCount').get(function () {
    return this.comments.length;
});

postSchema.virtual('isPublished').get(function () {
    return this.status === 'Published';
});

// Static methods
postSchema.statics.findBySlug = function (slug: string) {
    return this.findOne({ slug })
        .populate('author', 'name email')
        .populate('comments.user', 'name email');
};

postSchema.statics.findByAuthor = async function (
    authorId: string,
    options: { status?: string; limit?: number; page?: number } = {}
) {
    const query = this.find({ author: authorId });

    if (options.status) {
        query.where('status').equals(options.status);
    }

    const limit = options.limit || 10;
    const page = options.page || 1;
    const skip = (page - 1) * limit;

    return query
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name email');
};

postSchema.statics.findRelated = async function (postId: string, limit: number = 5) {
    const post = await this.findById(postId);
    if (!post) return [];

    return this.find({
        _id: { $ne: postId },
        status: 'Published',
        $or: [
            { tags: { $in: post.tags } },
            { author: post.author }
        ]
    })
        .limit(limit)
        .populate('author', 'name email')
        .sort({ createdAt: -1 });
};

// Create and export the model
const Post = mongoose.model<IPostDocument, IPostModel>('Post', postSchema);

export default Post;