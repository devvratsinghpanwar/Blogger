
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const handleUserSignup = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        // Validate required fields
        if (!fullName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields (fullName, email, password) are required"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists"
            });
        }

        // Create new user (password hashing will be handled by the pre-save middleware)
        const newUser = new User({
            fullName,
            email,
            password
        });

        // Save user to database
        const savedUser = await newUser.save();

        // Return success response (don't send password and salt back)
        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                id: savedUser._id,
                fullName: savedUser.fullName,
                email: savedUser.email,
                profileImageUrl: savedUser.profileImageUrl,
                createdAt: savedUser.createdAt
            }
        });

    } catch (error) {
        console.error("Error in handleUserSignup:", error);
        
        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validationErrors
            });
        }

        // Handle duplicate key error (email already exists)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists"
            });
        }

        // Handle other errors
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

const handleUserSignin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Verify password
        const isPasswordValid = user.verifyPassword(password);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user._id, 
                email: user.email,
                role: user.role 
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        // Return success response
        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                profileImageUrl: user.profileImageUrl,
                role: user.role,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error("Error in handleUserSignin:", error);
        
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

module.exports = {
    handleUserSignup,
    handleUserSignin
};