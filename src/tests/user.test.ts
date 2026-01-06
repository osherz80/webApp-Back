import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import userModel from '../models/userModel';

let accessToken: string;
let userId: string;
let server: any;

beforeAll(async () => {
    server = app.listen(0);
});

afterAll(async () => {
    await mongoose.connection.close();
    server.close();
});

describe('User API', () => {
    const testUser = {
        email: 'user@example.com',
        password: 'password123',
        username: 'use_r',
    };

    beforeEach(async () => {
        await userModel.deleteMany({});
        await request(app).post('/auth/register').send(testUser);
        const response = await request(app).post('/auth/login').send({
            email: testUser.email,
            password: testUser.password,
        });
        accessToken = response.body.accessToken;
        userId = response.body.userId;
    });

    test('Get all users', async () => {
        const response = await request(app).get('/user');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toBeGreaterThan(0);
    });

    test('Get user by id', async () => {
        const response = await request(app)
            .get(`/user/${userId}`)
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toBe(200);
        expect(response.body.email).toBe(testUser.email);
        expect(response.body.password).toBeUndefined(); // Should not return password
    });
});
