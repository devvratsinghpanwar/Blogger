const { Schema, model } = require('mongoose');

const commentSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        maxlength: 500
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const blogSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Technology', 'Lifestyle', 'Travel', 'Food', 'Health', 'Education', 'Business', 'Others'],
        default: 'Others'
    },
    coverImage: {
        type: String,
        default: ''
    },
    excerpt: {
        type: String,
        maxlength: 300
    },
    likes: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    comments: [commentSchema],
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'published'
    },
    readTime: {
        type: Number, // in minutes
        default: 1
    },
    tags: [{
        type: String,
        trim: true
    }],
    views: {
        type: Number,
        default: 0
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for likes count
blogSchema.virtual('likesCount').get(function() {
    return this.likes ? this.likes.length : 0;
});

// Virtual for comments count
blogSchema.virtual('commentsCount').get(function() {
    return this.comments ? this.comments.length : 0;
});

// Pre-save middleware to calculate read time and excerpt
blogSchema.pre('save', function(next) {
    // Calculate read time (average reading speed: 200 words per minute)
    if (this.isModified('content')) {
        const wordCount = this.content.split(/\s+/).length;
        this.readTime = Math.ceil(wordCount / 150) || 1;
        
        // Generate excerpt if not provided
        if (!this.excerpt) {
            this.excerpt = this.content.length > 150 
                ? this.content.substring(0, 147) + '...' 
                : this.content;
        }
    }
    next();
});

// Index for better query performance
blogSchema.index({ author: 1, createdAt: -1 });
blogSchema.index({ category: 1, createdAt: -1 });
blogSchema.index({ status: 1, createdAt: -1 });
blogSchema.index({ title: 'text', content: 'text' }); // For text search

const Blog = model('Blog', blogSchema);

module.exports = Blog;
