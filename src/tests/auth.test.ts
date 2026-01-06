import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import userModel from '../models/userModel';
import jwt from 'jsonwebtoken';


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
    test('Register - Missing fields', async () => {
        const response = await request(app).post('/auth/register').send({ email: 'test@test.com' });
        expect(response.status).toBe(400);
    });

    test('Register - Duplicate user', async () => {
        await request(app).post('/auth/register').send(testUser);
        const response = await request(app).post('/auth/register').send(testUser);
        expect(response.status).toBe(409);
    });

    test('Login - Invalid credentials', async () => {
        await request(app).post('/auth/register').send(testUser);
        const response = await request(app).post('/auth/login').send({
            email: testUser.email,
            password: 'wrongpassword',
        });
        expect(response.status).toBe(401);
    });

    test('Refresh - Missing token', async () => {
        const response = await request(app).post('/auth/refresh').send({});
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Missing refresh token');
    });

    test('Refresh - Invalid format token', async () => {
        const response = await request(app).post('/auth/refresh').send({ refreshToken: 'not-a-jwt' });
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid refresh token');
    });

    test('Refresh - Token not in user list', async () => {
        await request(app).post('/auth/register').send(testUser);
        const loginRes = await request(app).post('/auth/login').send({
            email: testUser.email,
            password: testUser.password,
        });
        const refreshToken = loginRes.body.refreshToken;

        // Manually remove the token from the user in DB
        await userModel.updateOne(
            { email: testUser.email },
            { $set: { refreshTokens: [] } }
        );

        const response = await request(app).post('/auth/refresh').send({ refreshToken });
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid refresh token');
    });

    test('Refresh - User not found', async () => {
        // Generate a valid token for a non-existent user
        const refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'refreshSecret';
        const fakeUserId = new mongoose.Types.ObjectId();
        const fakeToken = jwt.sign({ userId: fakeUserId.toString() }, refreshTokenSecret);

        const response = await request(app).post('/auth/refresh').send({ refreshToken: fakeToken });
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid refresh token');
    });

    test('Logout - Missing token', async () => {
        const response = await request(app).post('/auth/logout').send({});
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Missing refresh token');
    });

    test('Logout - Invalid format token', async () => {
        const response = await request(app).post('/auth/logout').send({ refreshToken: 'not-a-jwt' });
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid refresh token');
    });

    test('Logout - Token not in user list', async () => {
        await request(app).post('/auth/register').send(testUser);
        const loginRes = await request(app).post('/auth/login').send({
            email: testUser.email,
            password: testUser.password,
        });
        const refreshToken = loginRes.body.refreshToken;

        // Manually remove the token from the user in DB
        await userModel.updateOne(
            { email: testUser.email },
            { $set: { refreshTokens: [] } }
        );

        const response = await request(app).post('/auth/logout').send({ refreshToken });
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid refresh token');
    });

    test('Logout - User not found', async () => {
        const refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'refreshSecret';
        const fakeUserId = new mongoose.Types.ObjectId();
        const fakeToken = jwt.sign({ userId: fakeUserId.toString() }, refreshTokenSecret);

        const response = await request(app).post('/auth/logout').send({ refreshToken: fakeToken });
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid refresh token');
    });
});


