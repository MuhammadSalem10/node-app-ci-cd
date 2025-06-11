const request = require('supertest');
const { app, server } = require('../server');

describe('API Endpoints', () => {
    afterAll((done) => {
        server.close(done);
    });

    test('GET / should return hello message', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Hello World from CI/CD Pipeline!');
    });

    test('GET /health should return health status', async () => {
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('OK');
        expect(response.body).toHaveProperty('timestamp');
    });

    test('POST /calculate should add numbers', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({ a: 5, b: 3, operation: 'add' });

        expect(response.status).toBe(200);
        expect(response.body.result).toBe(8);
    });

    test('POST /calculate should handle division by zero', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({ a: 5, b: 0, operation: 'divide' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Division by zero');
    });

    test('POST /calculate should validate input types', async () => {
        const response = await request(app)
            .post('/calculate')
            .send({ a: 'not-a-number', b: 3, operation: 'add' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Both a and b must be numbers');
    });
});