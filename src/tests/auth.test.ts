import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import userModel from '../models/userModel';

let server: any;

beforeAll(async () => {
    console.log('Before All');
    server = app.listen(0);
});

afterAll(async () => {
    await mongoose.connection.close();
    server.close();
});

describe('Auth API', () => {
    const testUser = {
        email: 'user123@example.com',
        password: 'password123',
        username: 'user123',
    };

    beforeEach(async () => {
        await userModel.deleteMany({});
    });

    test('Register a new user', async () => {
        const response = await request(app).post('/auth/register').send(testUser);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('userId');
    });

    test('Login user', async () => {
        await request(app).post('/auth/register').send(testUser);
        const response = await request(app).post('/auth/login').send({
            email: testUser.email,
            password: testUser.password,
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('accessToken');
        expect(response.body).toHaveProperty('refreshToken');
        expect(response.body).toHaveProperty('userId');
    });

    test('Refresh token', async () => {
         await request(app).post('/auth/register').send(testUser);
        const loginRes = await request(app).post('/auth/login').send({
            email: testUser.email,
            password: testUser.password,
        });
        const refreshToken = loginRes.body.refreshToken;

        const response = await request(app).post('/auth/refresh').send({ refreshToken });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('accessToken');
        expect(response.body).toHaveProperty('refreshToken');
    });

    test('Logout user', async () => {
         await request(app).post('/auth/register').send(testUser);
        const loginRes = await request(app).post('/auth/login').send({
            email: testUser.email,
            password: testUser.password,
        });
        const refreshToken = loginRes.body.refreshToken;
        const response = await request(app).post('/auth/logout').send({ refreshToken });
        expect(response.status).toBe(200);
    });
});
