const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/index');
const { JWT_SECRET } = require('../../src/middleware/auth');
const { esClient, INDEX_NAME } = require('../../src/config/elasticsearch');

describe('Resources API Integration Tests', () => {
    let adminToken;
    let createdResourceId;

    beforeAll(async () => {
        try {
            await esClient.cluster.health({ wait_for_status: 'yellow', timeout: '30s' });
        } catch (err) {
            console.warn('Elasticsearch not available, integration tests will be skipped.');
        }

        // Generate admin token
        adminToken = jwt.sign({ username: 'admin', role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
    });

    describe('POST /api/auth/login', () => {
        test('should return token for valid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ username: 'admin', password: 'admin123' });
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body).toHaveProperty('username', 'admin');
            expect(res.body).toHaveProperty('role', 'admin');
        });

        test('should return 401 for invalid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ username: 'admin', password: 'wrong' });
            expect(res.status).toBe(401);
        });

        test('should return 400 for missing credentials', async () => {
            const res = await request(app).post('/api/auth/login').send({});
            expect(res.status).toBe(400);
        });
    });

    describe('POST /api/resources (Create)', () => {
        test('should create a resource with valid token', async () => {
            const newResource = {
                title: 'Test Resource for Integration Testing',
                authors: ['Test Author'],
                subject: 'Testing',
                publisher: 'Test Publisher',
                publication_year: 2024,
                resource_type: 'book',
                isbn: '978-0000000001',
                url: 'https://example.com/test',
                description: 'A test resource created during integration testing.',
            };

            const res = await request(app)
                .post('/api/resources')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newResource);

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('id');
            expect(res.body).toHaveProperty('message', 'Resource created successfully.');
            createdResourceId = res.body.id;
        });

        test('should return 401 without auth token', async () => {
            const res = await request(app)
                .post('/api/resources')
                .send({ title: 'Unauthorized Resource' });
            expect(res.status).toBe(401);
        });

        test('should return 400 for missing title', async () => {
            const res = await request(app)
                .post('/api/resources')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ authors: ['Someone'] });
            expect(res.status).toBe(400);
        });
    });

    describe('GET /api/resources/:id (Read)', () => {
        test('should return a resource by ID', async () => {
            if (!createdResourceId) return;
            const res = await request(app).get(`/api/resources/${createdResourceId}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('title', 'Test Resource for Integration Testing');
        });

        test('should return 404 for non-existent resource', async () => {
            const res = await request(app).get('/api/resources/nonexistent_id_12345');
            expect(res.status).toBe(404);
        });
    });

    describe('PUT /api/resources/:id (Update)', () => {
        test('should update a resource with valid token', async () => {
            if (!createdResourceId) return;
            const res = await request(app)
                .put(`/api/resources/${createdResourceId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ title: 'Updated Test Resource' });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('message', 'Resource updated successfully.');
        });

        test('should return 401 without auth token', async () => {
            if (!createdResourceId) return;
            const res = await request(app)
                .put(`/api/resources/${createdResourceId}`)
                .send({ title: 'Should Not Update' });
            expect(res.status).toBe(401);
        });
    });

    describe('DELETE /api/resources/:id (Delete)', () => {
        test('should delete a resource with valid token', async () => {
            if (!createdResourceId) return;
            const res = await request(app)
                .delete(`/api/resources/${createdResourceId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('message', 'Resource deleted successfully.');
        });

        test('should return 401 without auth token', async () => {
            const res = await request(app).delete('/api/resources/some_id');
            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/resources (List)', () => {
        test('should list all resources with pagination', async () => {
            const res = await request(app).get('/api/resources?page=1&size=5');
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('results');
            expect(res.body).toHaveProperty('total');
            expect(res.body).toHaveProperty('page', 1);
            expect(res.body.results.length).toBeLessThanOrEqual(5);
        });
    });
});
