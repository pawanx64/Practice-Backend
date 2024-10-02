const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { isLoggedIn, isAdmin } = require('../Middlewares/Auth');
const jwtSecret = process.env.JWT_SECRET;

// Secure cookie options
const cookieOptions = {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    withCredentials: true,
};

// Signup Route
router.post("/signup", async (req, res) => {
    const { email, password, username } = req.body;
    try {
        // already logged in
        if (req.cookies && req.cookies.token) {
            return res.status(400).json({ msg: "Already logged in" });
        }

        // checking if email already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ msg: "E-mail already exists" });
        }

        // hashing the password and saving
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        // generate token and save cookie and user
        const token = jwt.sign({ id: newUser._id }, jwtSecret, { expiresIn: '1d' });
        res.cookie('token', token, cookieOptions);
        await newUser.save();

        res.status(201).json({ msg: "User created successfully", newUser });
    } catch (error) {
        console.error("Signup error:", error); // Logging the error for debugging
        res.status(500).json({ msg: "Server error during signup" });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // already logged in
        if (req.cookies && req.cookies.token) {
            return res.status(400).json({ msg: "Already logged in" });
        }

        // no user found 
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        // checking password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ msg: "Invalid password" });
        }

        const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1d' });
        res.cookie('token', token, cookieOptions);

        res.status(200).json({ msg: "Login successful", user });
    } catch (error) {
        console.error("Login error:", error); // Logging the error for debugging
        res.status(500).json({ msg: 'Login failed due to server error' });
    }
});

// Logout Route
router.get('/logout', (req, res) => {
    try {
        // already logged out
        if (!req.cookies || !req.cookies.token) {
            return res.status(400).json({ msg: "Not logged in" });
        }

        res.clearCookie('token');
        res.status(200).json({ msg: "Logged out successfully" });
    } catch (error) {
        console.error("Logout error:", error); // Logging the error for debugging
        res.status(500).json({ msg: "Server error during logout" });
    }
});

// is loggedIn route
router.get('/isLoggedIn', isLoggedIn, (req, res) => {
    res.status(200).json({ isLoggedIn: true });
});

// is Admin route 
router.get('/isAdmin', isLoggedIn, isAdmin, (req, res) => {
    res.status(200).json({ isAdmin: true });
});

module.exports = router;