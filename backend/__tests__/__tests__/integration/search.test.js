const request = require('supertest');
const app = require('../../src/index');
const { esClient, INDEX_NAME } = require('../../src/config/elasticsearch');

// These tests require Elasticsearch to be running
describe('Search API Integration Tests', () => {
    beforeAll(async () => {
        // Wait a moment for ES to be ready
        try {
            await esClient.cluster.health({ wait_for_status: 'yellow', timeout: '30s' });
        } catch (err) {
            console.warn('Elasticsearch not available, integration tests will be skipped.');
        }
    });

    describe('GET /api/search', () => {
        test('should return search results for a keyword query', async () => {
            const res = await request(app).get('/api/search?q=algorithms');
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('total');
            expect(res.body).toHaveProperty('results');
            expect(res.body).toHaveProperty('page', 1);
            expect(Array.isArray(res.body.results)).toBe(true);
        });

        test('should return all results when no query is provided', async () => {
            const res = await request(app).get('/api/search');
            expect(res.status).toBe(200);
            expect(res.body.total).toBeGreaterThan(0);
        });

        test('should return results filtered by subject', async () => {
            const res = await request(app).get('/api/search?subject=Computer Science');
            expect(res.status).toBe(200);
            if (res.body.results.length > 0) {
                res.body.results.forEach((result) => {
                    expect(result.subject).toBe('Computer Science');
                });
            }
        });

        test('should return results filtered by resource type', async () => {
            const res = await request(app).get('/api/search?type=journal');
            expect(res.status).toBe(200);
            if (res.body.results.length > 0) {
                res.body.results.forEach((result) => {
                    expect(result.resource_type).toBe('journal');
                });
            }
        });

        test('should return results filtered by year range', async () => {
            const res = await request(app).get('/api/search?year_from=2020&year_to=2023');
            expect(res.status).toBe(200);
            if (res.body.results.length > 0) {
                res.body.results.forEach((result) => {
                    expect(result.publication_year).toBeGreaterThanOrEqual(2020);
                    expect(result.publication_year).toBeLessThanOrEqual(2023);
                });
            }
        });

        test('should support pagination', async () => {
            const page1 = await request(app).get('/api/search?page=1&size=5');
            const page2 = await request(app).get('/api/search?page=2&size=5');
            expect(page1.status).toBe(200);
            expect(page2.status).toBe(200);
            expect(page1.body.page).toBe(1);
            expect(page2.body.page).toBe(2);
            if (page1.body.total > 5) {
                expect(page1.body.results[0].id).not.toBe(page2.body.results[0].id);
            }
        });

        test('should return highlights for keyword search', async () => {
            const res = await request(app).get('/api/search?q=algorithms');
            expect(res.status).toBe(200);
            if (res.body.results.length > 0) {
                const hasHighlight = res.body.results.some(
                    (r) => r.highlight && Object.keys(r.highlight).length > 0
                );
                expect(hasHighlight).toBe(true);
            }
        });

        test('should handle partial keyword matching', async () => {
            const res = await request(app).get('/api/search?q=algo');
            expect(res.status).toBe(200);
            expect(res.body.results.length).toBeGreaterThan(0);
        });
    });

    describe('GET /api/search/filters', () => {
        test('should return available filter values', async () => {
            const res = await request(app).get('/api/search/filters');
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('subjects');
            expect(res.body).toHaveProperty('resource_types');
            expect(res.body).toHaveProperty('publishers');
            expect(res.body).toHaveProperty('year_range');
            expect(Array.isArray(res.body.subjects)).toBe(true);
        });
    });

    describe('GET /api/search/suggestions', () => {
        test('should return suggestions for partial query', async () => {
            const res = await request(app).get('/api/search/suggestions?q=deep');
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('suggestions');
            expect(Array.isArray(res.body.suggestions)).toBe(true);
        });

        test('should return empty suggestions for short query', async () => {
            const res = await request(app).get('/api/search/suggestions?q=a');
            expect(res.status).toBe(200);
            expect(res.body.suggestions).toHaveLength(0);
        });
    });

    describe('GET /api/health', () => {
        test('should return health status', async () => {
            const res = await request(app).get('/api/health');
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('status');
            expect(res.body).toHaveProperty('timestamp');
        });
    });
});
