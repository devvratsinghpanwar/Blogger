const Blog = require('../models/blog');
const User = require('../models/user');
const mongoose = require('mongoose');

// Create a new blog post
const createBlog = async (req, res) => {
    try {
        const { title, content, category, coverImage, excerpt, tags, status } = req.body;
        const authorId = req.userId;

        // Validate required fields
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: "Title and content are required"
            });
        }

        // Create new blog post
        const newBlog = new Blog({
            title,
            content,
            author: authorId,
            category: category || 'Others',
            coverImage: coverImage || '',
            excerpt,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            status: status || 'published'
        });

        // Save blog to database
        const savedBlog = await newBlog.save();
        
        // Populate author details
        await savedBlog.populate('author', 'fullName email profileImageUrl');

        res.status(201).json({
            success: true,
            message: "Blog created successfully",
            blog: savedBlog
        });

    } catch (error) {
        console.error("Error in createBlog:", error);
        
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validationErrors
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get all blog posts with pagination and filtering
const getAllBlogs = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            category, 
            author, 
            status = 'published',
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter object
        const filter = { status };
        
        if (category && category !== 'all') {
            filter.category = category;
        }
        
        if (author) {
            filter.author = author;
        }
        
        // --- IMPROVED SEARCH LOGIC WITH AUTHOR NAME SUPPORT ---
        
        // Calculate pagination
        const skip = (page - 1) * limit;
        
        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        if (search) {
            // Create a more flexible search pattern that handles partial matches
            const searchTerms = search.trim().split(/\s+/); // Split by whitespace
            const searchPatterns = searchTerms.map(term => 
                new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') // Escape special chars and case-insensitive
            );
            
            // Create search conditions for each term including author name
            const searchConditions = searchPatterns.map(pattern => ({
                $or: [
                    { title: pattern },
                    { content: pattern },
                    { category: pattern },
                    { tags: { $in: [pattern] } },
                    { excerpt: pattern },
                    { 'author.fullName': pattern } // Search in populated author name
                ]
            }));
            
            // Use aggregation pipeline to search including author names
            const pipeline = [
                // Lookup to join with users collection
                {
                    $lookup: {
                        from: 'users',
                        localField: 'author',
                        foreignField: '_id',
                        as: 'author'
                    }
                },
                { $unwind: '$author' },
                // Apply filters
                { $match: { ...filter } },
                // Apply search conditions
                {
                    $match: searchConditions.length > 1 
                        ? { $and: searchConditions }
                        : searchConditions[0]
                },
                // Sort
                { $sort: sort },
                // Add pagination facet
                {
                    $facet: {
                        blogs: [
                            { $skip: skip },
                            { $limit: parseInt(limit) },
                            {
                                $project: {
                                    title: 1,
                                    content: 1,
                                    excerpt: 1,
                                    category: 1,
                                    tags: 1,
                                    status: 1,
                                    coverImage: 1,
                                    views: 1,
                                    likes: 1,
                                    comments: 1,
                                    createdAt: 1,
                                    updatedAt: 1,
                                    'author._id': 1,
                                    'author.fullName': 1,
                                    'author.email': 1,
                                    'author.profileImageUrl': 1
                                }
                            }
                        ],
                        totalCount: [{ $count: "count" }]
                    }
                }
            ];

            const result = await Blog.aggregate(pipeline);
            const blogs = result[0].blogs;
            const totalBlogs = result[0].totalCount[0]?.count || 0;
            const totalPages = Math.ceil(totalBlogs / limit);

            return res.status(200).json({
                success: true,
                data: {
                    blogs,
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages,
                        totalBlogs,
                        hasNext: page < totalPages,
                        hasPrev: page > 1
                    }
                }
            });
        }

        // Original query for non-search requests
        // Execute query
        const [blogs, totalBlogs] = await Promise.all([
            Blog.find(filter)
                .populate('author', 'fullName email profileImageUrl')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .lean({ virtuals: true }), // Include virtuals like likesCount
            Blog.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(totalBlogs / limit);

        res.status(200).json({
            success: true,
            data: {
                blogs,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalBlogs,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            }
        });

    } catch (error) {
        console.error("Error in getAllBlogs:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get a single blog post by ID
const getBlogById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid blog ID"
            });
        }

        // Increment view count and get blog
        const blog = await Blog.findByIdAndUpdate(
            id,
            { $inc: { views: 1 } },
            { new: true }
        )
            .populate('author', 'fullName email profileImageUrl')
            .populate('comments.user', 'fullName profileImageUrl');

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        res.status(200).json({
            success: true,
            blog
        });

    } catch (error) {
        console.error("Error in getBlogById:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Update a blog post
const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const userId = req.userId;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid blog ID"
            });
        }

        // Find the blog and check ownership
        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        // Check if user is the author
        if (blog.author.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can only update your own blog posts"
            });
        }

        // Process tags if provided
        if (updates.tags && typeof updates.tags === 'string') {
            updates.tags = updates.tags.split(',').map(tag => tag.trim());
        }

        // Update the blog
        const updatedBlog = await Blog.findByIdAndUpdate(
            id,
            { ...updates, updatedAt: new Date() },
            { new: true, runValidators: true }
        ).populate('author', 'fullName email profileImageUrl');

        res.status(200).json({
            success: true,
            message: "Blog updated successfully",
            blog: updatedBlog
        });

    } catch (error) {
        console.error("Error in updateBlog:", error);
        
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validationErrors
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Delete a blog post
const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid blog ID"
            });
        }

        // Find the blog and check ownership
        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        // Check if user is the author
        if (blog.author.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own blog posts"
            });
        }

        await Blog.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Blog deleted successfully"
        });

    } catch (error) {
        console.error("Error in deleteBlog:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Like/Unlike a blog post
const toggleLikeBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid blog ID"
            });
        }

        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        // Check if user already liked the blog
        const likeIndex = blog.likes.findIndex(
            like => like.user.toString() === userId.toString()
        );

        let message;
        if (likeIndex > -1) {
            // User already liked, so unlike
            blog.likes.splice(likeIndex, 1);
            message = "Blog unliked successfully";
        } else {
            // User hasn't liked, so like
            blog.likes.push({ user: userId });
            message = "Blog liked successfully";
        }

        await blog.save();

        res.status(200).json({
            success: true,
            message,
            likesCount: blog.likes.length,
            isLiked: likeIndex === -1 // true if just liked, false if just unliked
        });

    } catch (error) {
        console.error("Error in toggleLikeBlog:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Add a comment to a blog post
const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.userId;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid blog ID"
            });
        }

        if (!content || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Comment content is required"
            });
        }

        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        // Add comment
        const newComment = {
            user: userId,
            content: content.trim()
        };

        blog.comments.push(newComment);
        await blog.save();

        // Populate the new comment with user details
        await blog.populate('comments.user', 'fullName profileImageUrl');
        
        // Get the newly added comment
        const addedComment = blog.comments[blog.comments.length - 1];

        res.status(201).json({
            success: true,
            message: "Comment added successfully",
            comment: addedComment,
            commentsCount: blog.comments.length
        });

    } catch (error) {
        console.error("Error in addComment:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Delete a comment
const deleteComment = async (req, res) => {
    try {
        const { id, commentId } = req.params;
        const userId = req.userId;

        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(commentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid blog ID or comment ID"
            });
        }

        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        // Find the comment
        const comment = blog.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }

        // Check if user owns the comment or is the blog author
        if (comment.user.toString() !== userId.toString() && 
            blog.author.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own comments or comments on your blog"
            });
        }

        // Remove the comment
        blog.comments.pull(commentId);
        await blog.save();

        res.status(200).json({
            success: true,
            message: "Comment deleted successfully",
            commentsCount: blog.comments.length
        });

    } catch (error) {
        console.error("Error in deleteComment:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get blogs by current user
const getMyBlogs = async (req, res) => {
    try {
        const userId = req.userId;
        const { page = 1, limit = 10, status } = req.query;

        // Build filter
        const filter = { author: userId };
        if (status) {
            filter.status = status;
        }

        const skip = (page - 1) * limit;

        const [blogs, totalBlogs] = await Promise.all([
            Blog.find(filter)
                .populate('author', 'fullName email profileImageUrl')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Blog.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(totalBlogs / limit);

        res.status(200).json({
            success: true,
            data: {
                blogs,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalBlogs,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            }
        });

    } catch (error) {
        console.error("Error in getMyBlogs:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get dashboard stats for current user
const getDashboardStats = async (req, res) => {
    try {
        const userId = req.userId;
        
        // Get current month start and end dates
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        // Aggregate stats for the user's blogs
        const stats = await Blog.aggregate([
            {
                $match: { author: new mongoose.Types.ObjectId(userId) }
            },
            {
                $group: {
                    _id: null,
                    totalBlogs: { $sum: 1 },
                    totalLikes: { $sum: { $size: "$likes" } },
                    totalComments: { $sum: { $size: "$comments" } },
                    totalViews: { $sum: "$views" },
                    blogsThisMonth: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $gte: ["$createdAt", monthStart] },
                                        { $lte: ["$createdAt", monthEnd] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        // If no blogs found, return default stats
        const dashboardStats = stats.length > 0 ? stats[0] : {
            totalBlogs: 0,
            totalLikes: 0,
            totalComments: 0,
            totalViews: 0,
            blogsThisMonth: 0
        };

        // Remove the MongoDB _id field
        delete dashboardStats._id;

        res.status(200).json({
            success: true,
            data: {
                stats: dashboardStats
            }
        });

    } catch (error) {
        console.error("Error in getDashboardStats:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = {
    createBlog,
    getAllBlogs,
    getBlogById,
    updateBlog,
    deleteBlog,
    toggleLikeBlog,
    addComment,
    deleteComment,
    getMyBlogs,
    getDashboardStats
};
