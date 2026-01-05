import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import commentModel from '../models/commentModel';
import postModel from '../models/postModel';
import userModel from '../models/userModel';

let accessToken: string;
let userId: string;
let postId: string;
let server: any;

beforeAll(async () => {
     server = app.listen(0);
});

afterAll(async () => {
    await mongoose.connection.close();
    server.close();
});

describe('Comment API', () => {
    const testUser = {
        email: 'commentuser@example.com',
        password: 'password123',
        username: 'comment_user',
    };

    beforeEach(async () => {
        await commentModel.deleteMany({});
        await postModel.deleteMany({});
        await userModel.deleteMany({});
        
        // Register and Login
        await request(app).post('/auth/register').send(testUser);
        const loginRes = await request(app).post('/auth/login').send({
            email: testUser.email,
            password: testUser.password,
        });
        accessToken = loginRes.body.accessToken;
        userId = loginRes.body.userId;

        // Create a Post
        const postRes = await request(app)
            .post('/post')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                title: 'Post for Comment',
                message: 'Post Message',
            });
        postId = postRes.body._id;
    });

    test('Create comment', async () => {
        const response = await request(app)
            .post('/comments')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                message: 'Test Comment',
                postId: postId
            });
        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Test Comment');
        expect(response.body.sender).toBe(userId);
        expect(response.body.postId).toBe(postId);
    });

    test('Get all comments', async () => {
         await request(app)
            .post('/comments')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                message: 'Test Comment',
                postId: postId
            });
        const response = await request(app).get('/comments');
        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
    });

    test('Delete comment', async () => {
        const commentRes = await request(app)
            .post('/comments')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                message: 'Test Comment',
                postId: postId
            });
        const commentId = commentRes.body._id;
        
        const response = await request(app)
            .delete(`/comments/${commentId}`)
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toBe(200);
    });
});
