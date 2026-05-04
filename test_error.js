const express = require('express');
const globalErrorHandler = require('./apps/backend/src/common/exceptions/GlobalErrorHandlerMiddleware');
const AppError = require('./apps/backend/src/common/exceptions/AppError');
const app = express();

app.get('/test', (req, res, next) => {
    next(new Error('This is a test error with a stack trace! /path/to/server'));
});

app.use(globalErrorHandler);

process.env.NODE_ENV = 'production';

const request = require('supertest');
request(app)
    .get('/test')
    .expect(500)
    .end((err, res) => {
        if (err) throw err;
        console.log("PRODUCTION ERROR RESPONSE:");
        console.log(JSON.stringify(res.body, null, 2));

        process.env.NODE_ENV = 'development';
        request(app)
            .get('/test')
            .expect(500)
            .end((err, res) => {
                if (err) throw err;
                console.log("\nDEVELOPMENT ERROR RESPONSE:");
                console.log(JSON.stringify(res.body, null, 2));
                process.exit(0);
            });
    });
