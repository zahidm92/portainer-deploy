const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ username: user.username, role: user.role, id: user.id }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, role: user.role, username: user.username });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Middleware to verify token and check for root role
const verifyRoot = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: 'No token provided' });

    try {
        const decoded = jwt.verify(token.split(" ")[1], JWT_SECRET);
        if (decoded.role !== 'root') {
            return res.status(403).json({ error: 'Access denied: Root privileges required.' });
        }
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Create User Route (Protected - Root only)
router.post('/register', verifyRoot, async (req, res) => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) return res.status(400).json({ error: 'Username already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const userRole = (role === 'root' || role === 'admin') ? role : 'admin';

        const newUser = await User.create({
            username,
            password: hashedPassword,
            role: userRole
        });

        res.status(201).json({ message: 'User created successfully', user: { username: newUser.username, role: newUser.role } });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET All Users (Root only)
router.get('/users', verifyRoot, async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'username', 'role', 'createdAt']
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE User (Root only)
router.delete('/users/:id', verifyRoot, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.role === 'root') {
            return res.status(403).json({ error: 'Cannot delete root user' });
        }

        await user.destroy();
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET Staff Members (Public)
router.get('/staff', async (req, res) => {
    try {
        const staff = await User.findAll({
            where: {
                role: ['admin', 'staff', 'root'] // Assuming admins can also take bookings? Or strictly staff? Prompt says "newuser(staff)". I'll include 'staff' and 'admin' just in case.
            },
            attributes: ['id', 'username', 'role']
        });
        res.json(staff);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
