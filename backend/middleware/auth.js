const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.startsWith('Bearer ') 
            ? authHeader.slice(7) 
            : null;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided."
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Get user from database to ensure user still exists
        const user = await User.findById(decoded.userId).select('-password -salt');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid token. User not found."
            });
        }

        // Add user to request object
        req.user = user;
        req.userId = user._id;
        
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: "Invalid token."
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Token expired."
            });
        }
        
        return res.status(500).json({
            success: false,
            message: "Internal server error during authentication."
        });
    }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: "Access denied. Admin privileges required."
        });
    }
};

// Optional authentication - doesn't fail if no token is provided
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.startsWith('Bearer ') 
            ? authHeader.slice(7) 
            : null;

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            const user = await User.findById(decoded.userId).select('-password -salt');
            
            if (user) {
                req.user = user;
                req.userId = user._id;
            }
        }
        
        next();
    } catch (error) {
        // For optional auth, we continue even if token is invalid
        next();
    }
};

// Helper function to generate JWT token
const generateToken = (userId, email, role) => {
    return jwt.sign(
        { userId, email, role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
    );
};

module.exports = {
    authenticateToken,
    requireAdmin,
    optionalAuth,
    generateToken
};
