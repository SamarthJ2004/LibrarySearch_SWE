const express = require('express');
const { esClient, INDEX_NAME } = require('../config/elasticsearch');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/resources/:id — get single resource
router.get('/:id', async (req, res) => {
    try {
        const result = await esClient.get({
            index: INDEX_NAME,
            id: req.params.id,
        });
        res.json({ id: result._id, ...result._source });
    } catch (err) {
        if (err.meta && err.meta.statusCode === 404) {
            return res.status(404).json({ error: 'Resource not found.' });
        }
        console.error('Get resource error:', err);
        res.status(500).json({ error: 'Failed to retrieve resource.' });
    }
});

// GET /api/resources — list all resources (paginated)
router.get('/', async (req, res) => {
    try {
        const { page = 1, size = 20 } = req.query;
        const from = (parseInt(page) - 1) * parseInt(size);

        const result = await esClient.search({
            index: INDEX_NAME,
            body: {
                from,
                size: parseInt(size),
                query: { match_all: {} },
                sort: [{ publication_year: 'desc' }, { 'title.keyword': 'asc' }],
            },
        });

        const hits = result.hits.hits.map((hit) => ({
            id: hit._id,
            ...hit._source,
        }));

        res.json({
            total: result.hits.total.value,
            page: parseInt(page),
            size: parseInt(size),
            total_pages: Math.ceil(result.hits.total.value / parseInt(size)),
            results: hits,
        });
    } catch (err) {
        console.error('List resources error:', err);
        res.status(500).json({ error: 'Failed to list resources.' });
    }
});

// POST /api/resources — create resource (admin only)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, authors, subject, publisher, publication_year, resource_type, isbn, url, description } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required.' });
        }

        const result = await esClient.index({
            index: INDEX_NAME,
            body: {
                title,
                authors: authors || [],
                subject: subject || '',
                publisher: publisher || '',
                publication_year: publication_year || null,
                resource_type: resource_type || 'book',
                isbn: isbn || '',
                url: url || '',
                description: description || '',
            },
            refresh: 'wait_for',
        });

        res.status(201).json({ id: result._id, message: 'Resource created successfully.' });
    } catch (err) {
        console.error('Create resource error:', err);
        res.status(500).json({ error: 'Failed to create resource.' });
    }
});

// PUT /api/resources/:id — update resource (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { title, authors, subject, publisher, publication_year, resource_type, isbn, url, description } = req.body;

        await esClient.update({
            index: INDEX_NAME,
            id: req.params.id,
            body: {
                doc: {
                    ...(title !== undefined && { title }),
                    ...(authors !== undefined && { authors }),
                    ...(subject !== undefined && { subject }),
                    ...(publisher !== undefined && { publisher }),
                    ...(publication_year !== undefined && { publication_year }),
                    ...(resource_type !== undefined && { resource_type }),
                    ...(isbn !== undefined && { isbn }),
                    ...(url !== undefined && { url }),
                    ...(description !== undefined && { description }),
                },
            },
            refresh: 'wait_for',
        });

        res.json({ id: req.params.id, message: 'Resource updated successfully.' });
    } catch (err) {
        if (err.meta && err.meta.statusCode === 404) {
            return res.status(404).json({ error: 'Resource not found.' });
        }
        console.error('Update resource error:', err);
        res.status(500).json({ error: 'Failed to update resource.' });
    }
});

// DELETE /api/resources/:id — delete resource (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await esClient.delete({
            index: INDEX_NAME,
            id: req.params.id,
            refresh: 'wait_for',
        });

        res.json({ message: 'Resource deleted successfully.' });
    } catch (err) {
        if (err.meta && err.meta.statusCode === 404) {
            return res.status(404).json({ error: 'Resource not found.' });
        }
        console.error('Delete resource error:', err);
        res.status(500).json({ error: 'Failed to delete resource.' });
    }
});

module.exports = router;
