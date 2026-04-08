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
        userId = response.body.user.id;
    });

    const validPostData = {
        bookTitle: 'Test Book',
        bookAuthor: 'Test Author',
        recommendation: 'Good book',
        rating: 5
    };

    test('Create post', async () => {
        const response = await request(app)
            .post('/post')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(validPostData);
        expect(response.status).toBe(201);
        expect(response.body.bookTitle).toBe('Test Book');
        expect(response.body.sender).toBe(userId);
    });

    test('Get all posts', async () => {
        await request(app)
            .post('/post')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(validPostData);
        const response = await request(app).get('/post');
        expect(response.status).toBe(200);
        expect(response.body.posts.length).toBeGreaterThan(0);
    });

    test('Get post by id', async () => {
        const postRes = await request(app)
            .post('/post')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(validPostData);
        const postId = postRes.body._id;
        const response = await request(app).get(`/post/${postId}`);
        expect(response.status).toBe(200);
        expect(response.body.bookTitle).toBe('Test Book');
    });

    test('Update post', async () => {
        const postRes = await request(app)
            .post('/post')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(validPostData);
        const postId = postRes.body._id;
        const response = await request(app)
            .put(`/post/${postId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ ...validPostData, bookTitle: 'Updated Book Title' });
        expect(response.status).toBe(200);
        expect(response.body.bookTitle).toBe('Updated Book Title');
    });

    test('Get posts by sender', async () => {
        await request(app)
            .post('/post')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(validPostData);

        const response = await request(app).get(`/post/user/${userId}`);
        expect(response.status).toBe(200);
        expect(response.body.posts.length).toBeGreaterThan(0);
        expect(response.body.posts[0].sender._id).toBe(userId);
    });

    test('Get post by id - Not Found', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const response = await request(app).get(`/post/${fakeId}`);
        expect(response.status).toBe(404);
    });

    test('Update post - Not Found', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const response = await request(app)
            .put(`/post/${fakeId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(validPostData);
        expect(response.status).toBe(404);
    });

    test('Create post - Invalid Data', async () => {
        const response = await request(app)
            .post('/post')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ bookTitle: '' }); // missing required fields
        expect(response.status).toBe(400);
    });
});

