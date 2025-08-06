const express = require('express');
const router = express.Router();
const { 
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
} = require('../controllers/blogControllers');
const { authenticateToken } = require('../middleware/auth');

// Health check route
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: "Blog routes are working"
    });
});

// Public routes (no authentication required)
router.get('/', getAllBlogs); // Get all blogs with filtering and pagination

// Specific protected routes (must come before /:id route)
router.get('/stats', authenticateToken, getDashboardStats); // Get dashboard stats for current user
router.get('/user/my-blogs', authenticateToken, getMyBlogs); // Get current user's blogs

// Public route for individual blog (must be after specific routes)
router.get('/:id', getBlogById); // Get single blog by ID

// Protected routes (authentication required)
router.use(authenticateToken); // Apply authentication middleware to all routes below

// Blog CRUD operations
router.post('/', createBlog); // Create new blog
router.put('/:id', updateBlog); // Update blog
router.delete('/:id', deleteBlog); // Delete blog

// Blog interactions
router.post('/:id/like', toggleLikeBlog); // Like/unlike blog
router.post('/:id/comments', addComment); // Add comment to blog
router.delete('/:id/comments/:commentId', deleteComment); // Delete comment

module.exports = router;
