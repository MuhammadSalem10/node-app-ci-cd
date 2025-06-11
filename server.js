const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: process.env.APP_VERSION || '1.0.0'
    });
});

// Hello World endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Hello World from CI/CD Pipeline!',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Simple calculator endpoint for testing
app.post('/calculate', (req, res) => {
    const { a, b, operation } = req.body;

    if (typeof a !== 'number' || typeof b !== 'number') {
        return res.status(400).json({ error: 'Both a and b must be numbers' });
    }

    let result;
    switch (operation) {
        case 'add':
            result = a + b;
            break;
        case 'subtract':
            result = a - b;
            break;
        case 'multiply':
            result = a * b;
            break;
        case 'divide':
            result = b !== 0 ? a / b : null;
            if (result === null) {
                return res.status(400).json({ error: 'Division by zero' });
            }
            break;
        default:
            return res.status(400).json({ error: 'Invalid operation' });
    }

    res.json({ result });
});

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server };