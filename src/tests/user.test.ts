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

    test('Get user profile', async () => {
        const response = await request(app)
            .get(`/user`)
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toBe(200);
        expect(response.body.returnUser.email).toBe(testUser.email);
        expect(response.body.returnUser.password).toBeUndefined(); // Should not return password
    });

    test('Update user profile', async () => {
        const response = await request(app)
            .put(`/user/update`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ username: 'new_username' });
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('User updated successfully');

        const verifyResponse = await request(app)
            .get(`/user`)
            .set('Authorization', `Bearer ${accessToken}`);
        expect(verifyResponse.body.returnUser.username).toBe('new_username');
    });

    test('Get user profile - Not Found', async () => {
        await userModel.deleteMany({});
        const response = await request(app)
            .get(`/user`)
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    });
});

