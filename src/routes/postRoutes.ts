import express from 'express';
const router = express.Router();
import postController from '../controllers/postController';
import authMiddleware from '../middleware/authMiddleware';

/**
* @swagger
* tags:
*   name: Posts
*   description: The Posts API
*/

/**
* @swagger
* components:
*   schemas:
*     Post:
*       type: object
*       required:
*         - title
*         - message
*         - sender
*       properties:
*         _id:
*           type: string
*           description: The auto-generated id of the post
*         title:
*           type: string
*           description: The title of the post
*         message:
*           type: string
*           description: The message of the post
*         sender:
*           type: string
*           description: The sender id
*       example:
*         _id: 23423432423
*         title: My First Post
*         message: Hello World
*         sender: 23423432423
*/

/**
* @swagger
* /post:
*   post:
*     summary: Create a new post
*     tags: [Posts]
*     security:
*       - bearerAuth: []
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - title
*               - message
*             properties:
*               title:
*                 type: string
*               message:
*                 type: string
*     responses:
*       201:
*         description: The post was created
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/Post'
*       400:
*         description: Post creation failed
*/
router.post('/', authMiddleware, postController.addPost);

/**
* @swagger
* /post:
*   get:
*     summary: Get all posts
*     tags: [Posts]
*     parameters:
*       - in: query
*         name: sender
*         schema:
*           type: string
*         description: The sender id
*     responses:
*       200:
*         description: The list of posts
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                 $ref: '#/components/schemas/Post'
*/
router.get('/', postController.getAllPosts);

/**
* @swagger
* /post/{id}:
*   get:
*     summary: Get the post by id
*     tags: [Posts]
*     parameters:
*       - in: path
*         name: id
*         schema:
*           type: string
*         required: true
*         description: The post id
*     responses:
*       200:
*         description: The post description by id
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/Post'
*       404:
*         description: The post was not found
*/
router.get('/:id', postController.getPostById);

/**
* @swagger
* /post/{id}:
*   put:
*     summary: Update the post by id
*     tags: [Posts]
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: path
*         name: id
*         schema:
*           type: string
*         required: true
*         description: The post id
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               title:
*                 type: string
*               message:
*                 type: string
*     responses:
*       200:
*         description: The post was updated
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/Post'
*       404:
*         description: The post was not found
*/
router.put('/:id', authMiddleware, postController.updatePost);

export default router;
