const express = require('express');
const cors = require('cors');
require('dotenv').config();

const searchRoutes = require('./routes/search');
const resourceRoutes = require('./routes/resources');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/search', searchRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', async (req, res) => {
    try {
        const { esClient } = require('./config/elasticsearch');
        const health = await esClient.cluster.health();
        res.json({
            status: 'ok',
            elasticsearch: health.status,
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        res.status(503).json({
            status: 'error',
            message: 'Elasticsearch is not available',
            timestamp: new Date().toISOString(),
        });
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Library Search API running on http://localhost:${PORT}`);
        console.log(`📚 Search:    GET http://localhost:${PORT}/api/search?q=algorithms`);
        console.log(`🔐 Admin:     POST http://localhost:${PORT}/api/auth/login`);
        console.log(`❤️  Health:    GET http://localhost:${PORT}/api/health`);
    });
}

module.exports = app;
