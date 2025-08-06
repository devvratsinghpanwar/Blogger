const express = require('express');
const router = express.Router();
const { handleUserSignup, handleUserSignin } = require('../controllers/userControllers');
const { authenticateToken } = require('../middleware/auth');

router.get('/health', (req, res) => {
    res.send("hello from user routes");
});

// Public routes
router.post('/signup', handleUserSignup);
router.post('/signin', handleUserSignin);

// Protected routes (example)
router.get('/profile', authenticateToken, (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

module.exports = router;
