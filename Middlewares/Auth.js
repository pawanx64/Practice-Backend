const jwt = require('jsonwebtoken');
const User = require('../models/user');

const isLoggedIn = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        // if token not present
        if (!token) {
            return res.status(401).json({ msg: "Login to continue" });
        }

        // checking user in DB
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        // if user exists
        req.user = user;
        next();
    } catch (error) {
        console.error("Authentication error:", error); // Log the error for debugging
        return res.status(500).json({ msg: "Server error during authentication" });
    }
};

const isAdmin = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        // Check if token exists
        if (!token) {
            return res.status(401).json({ msg: "Access denied - No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        // Check if user is an admin
        if (!user || user.id !== process.env.AdminID) {
            return res.status(403).json({ msg: "Access denied - Admin only" });
        }

        next();
    } catch (error) {
        console.error("Admin access error:", error); // Log the error for debugging
        return res.status(500).json({ msg: "Server error during admin access check" });
    }
};

module.exports = { isLoggedIn, isAdmin };
