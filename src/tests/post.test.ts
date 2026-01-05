import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import postModel from '../models/postModel';
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

describe('Post API', () => {
    const testUser = {
        email: 'postuser@example.com',
        password: 'password123',
        username: 'post_user',
    };

    beforeEach(async () => {
        await postModel.deleteMany({});
        await userModel.deleteMany({});
        await request(app).post('/auth/register').send(testUser);
        const response = await request(app).post('/auth/login').send({
            email: testUser.email,
            password: testUser.password,
        });
        accessToken = response.body.accessToken;
        userId = response.body.userId;
    });

    test('Create post', async () => {
        const response = await request(app)
            .post('/post')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                title: 'Test Post',
                message: 'This is a test post',
            });
        expect(response.status).toBe(201);
        expect(response.body.title).toBe('Test Post');
        expect(response.body.sender).toBe(userId);
    });

    test('Get all posts', async () => {
        await request(app)
            .post('/post')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                title: 'Test Post',
                message: 'This is a test post',
            });
        const response = await request(app).get('/post');
        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
    });

    test('Get post by id', async () => {
        const postRes = await request(app)
            .post('/post')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                title: 'Test Post',
                message: 'This is a test post',
            });
        const postId = postRes.body._id;
        const response = await request(app).get(`/post/${postId}`);
        expect(response.status).toBe(200);
        expect(response.body.title).toBe('Test Post');
    });

    test('Update post', async () => {
        const postRes = await request(app)
            .post('/post')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                title: 'Test Post',
                message: 'This is a test post',
            });
        const postId = postRes.body._id;
        const response = await request(app)
            .put(`/post/${postId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                title: 'Updated Title',
                message: 'Updated Message',
            });
        expect(response.status).toBe(200);
        expect(response.body.title).toBe('Updated Title');
    });
});
