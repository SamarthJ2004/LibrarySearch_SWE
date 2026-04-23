const express = require('express');
const { esClient, INDEX_NAME } = require('../config/elasticsearch');
const { buildSearchQuery } = require('../utils/queryBuilder');

const router = express.Router();

// GET /api/search
router.get('/', async (req, res) => {
    try {
        const { q, author, subject, year_from, year_to, type, page = 1, size = 10 } = req.query;

        const searchQuery = buildSearchQuery({ q, author, subject, year_from, year_to, type, page, size });

        const result = await esClient.search({
            index: INDEX_NAME,
            body: searchQuery,
        });

        const hits = result.hits.hits.map((hit) => ({
            id: hit._id,
            score: hit._score,
            ...hit._source,
            highlight: hit.highlight || {},
        }));

        res.json({
            total: result.hits.total.value,
            page: parseInt(page),
            size: parseInt(size),
            total_pages: Math.ceil(result.hits.total.value / parseInt(size)),
            results: hits,
        });
    } catch (err) {
        console.error('Search error:', err);
        res.status(500).json({ error: 'Search failed. Please try again.' });
    }
});

// GET /api/search/suggestions — for autocomplete
router.get('/suggestions', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.trim().length < 2) {
            return res.json({ suggestions: [] });
        }

        const result = await esClient.search({
            index: INDEX_NAME,
            body: {
                size: 5,
                _source: ['title', 'authors', 'resource_type'],
                query: {
                    multi_match: {
                        query: q.trim(),
                        fields: ['title.autocomplete^3', 'authors'],
                        type: 'best_fields',
                    },
                },
            },
        });

        const suggestions = result.hits.hits.map((hit) => ({
            id: hit._id,
            title: hit._source.title,
            authors: hit._source.authors,
            resource_type: hit._source.resource_type,
        }));

        res.json({ suggestions });
    } catch (err) {
        console.error('Suggestions error:', err);
        res.status(500).json({ error: 'Failed to get suggestions.' });
    }
});

// GET /api/search/filters — get available filter values
router.get('/filters', async (req, res) => {
    try {
        const result = await esClient.search({
            index: INDEX_NAME,
            body: {
                size: 0,
                aggs: {
                    subjects: {
                        terms: { field: 'subject.keyword', size: 50 },
                    },
                    resource_types: {
                        terms: { field: 'resource_type', size: 10 },
                    },
                    publishers: {
                        terms: { field: 'publisher', size: 50 },
                    },
                    year_range: {
                        stats: { field: 'publication_year' },
                    },
                },
            },
        });

        res.json({
            subjects: result.aggregations.subjects.buckets.map((b) => b.key),
            resource_types: result.aggregations.resource_types.buckets.map((b) => b.key),
            publishers: result.aggregations.publishers.buckets.map((b) => b.key),
            year_range: {
                min: result.aggregations.year_range.min,
                max: result.aggregations.year_range.max,
            },
        });
    } catch (err) {
        console.error('Filters error:', err);
        res.status(500).json({ error: 'Failed to load filters.' });
    }
});

module.exports = router;
