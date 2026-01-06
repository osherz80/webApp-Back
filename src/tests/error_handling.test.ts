import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import postModel from '../models/postModel';
import userModel from '../models/userModel';
import commentModel from '../models/commentModel';

let server: any;

beforeAll(async () => {
    server = app.listen(0);
});

afterAll(async () => {
    await mongoose.connection.close();
    server.close();
});

describe('Database Error Handling', () => {
    test('Should handle error in getAllPosts', async () => {
        const spy = jest.spyOn(postModel, 'find').mockImplementationOnce(() => {
            throw new Error('Database failure');
        });

        const response = await request(app).get('/post');
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Database failure');

        spy.mockRestore();
    });

    test('Should handle error in getUserById', async () => {
        const user = { email: 'err2@test.com', password: '123', username: 'err2' };
        await request(app).post('/auth/register').send(user);
        const loginRes = await request(app).post('/auth/login').send({ email: user.email, password: user.password });
        const token = loginRes.body.accessToken;

        const spy = jest.spyOn(userModel, 'findById').mockImplementationOnce(() => {
            throw new Error('User fetch failure');
        });

        const response = await request(app)
            .get(`/user/${loginRes.body.userId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('User fetch failure');

        spy.mockRestore();
    });

    test('Should handle error in addComment', async () => {
        const spy = jest.spyOn(commentModel.prototype, 'save').mockImplementationOnce(() => {
            throw new Error('Save failure');
        });

        const user = { email: 'err@test.com', password: '123', username: 'err' };
        await request(app).post('/auth/register').send(user);
        const loginRes = await request(app).post('/auth/login').send({ email: user.email, password: user.password });
        const token = loginRes.body.accessToken;

        const response = await request(app)
            .post('/comments')
            .set('Authorization', `Bearer ${token}`)
            .send({ message: 'test', postId: new mongoose.Types.ObjectId() });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Save failure');

        spy.mockRestore();
    });
});
