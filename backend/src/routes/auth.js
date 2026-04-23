const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required.' });
        }

        if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const token = jwt.sign(
            { username, role: 'admin' },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, username, role: 'admin' });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// GET /api/auth/verify
router.get('/verify', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ valid: false });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ valid: true, username: decoded.username, role: decoded.role });
    } catch (err) {
        res.status(401).json({ valid: false });
    }
});

module.exports = router;
