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
*         - bookTitle
*         - bookAuthor
*         - recommendation
*         - rating
*         - sender
*       properties:
*         _id:
*           type: string
*           description: The auto-generated id of the post
*         bookTitle:
*           type: string
*           description: The title of the book
*         bookAuthor:
*           type: string
*           description: The author of the book
*         bookDescription:
*           type: string
*           description: The description of the book
*         bookImage:
*           type: string
*           description: URL of the book image from Google Books
*         userImage:
*           type: string
*           description: URL of the user-uploaded book image
*         recommendation:
*           type: string
*           description: User's recommendation/review
*         rating:
*           type: number
*           description: User's rating (1-5)
*         sender:
*           $ref: '#/components/schemas/User'
*       example:
*         _id: 642f1b2b3c4d5e6f7a8b9c0d
*         bookTitle: The Great Gatsby
*         bookAuthor: F. Scott Fitzgerald
*         bookDescription: A classic novel about the American Dream.
*         bookImage: https://books.google.com/image.jpg
*         userImage: uploads/my-book-cover.jpg
*         recommendation: A must-read for everyone!
*         rating: 5
*         sender: 642f1b2b3c4d5e6f7a8b9c0e
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
*               - bookTitle
*               - bookAuthor
*               - recommendation
*               - rating
*             properties:
*               bookTitle:
*                 type: string
*               bookAuthor:
*                 type: string
*               bookDescription:
*                 type: string
*               bookImage:
*                 type: string
*               userImage:
*                 type: string
*               recommendation:
*                 type: string
*               rating:
*                 type: number
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
/**
* @swagger
* /post/ai-recommendation:
*   get:
*     summary: Get AI-generated book recommendations based on user's last posts
*     tags: [Posts]
*     security:
*       - bearerAuth: []
*     responses:
*       200:
*         description: A JSON object containing AI-generated recommendations in Google Books format
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 items:
*                   type: array
*                   items:
*                     type: object
*                     properties:
*                       volumeInfo:
*                         type: object
*                         properties:
*                           title:
*                             type: string
*                           authors:
*                             type: array
*                             items:
*                               type: string
*                           description:
*                             type: string
*                           imageLinks:
*                             type: object
*                             properties:
*                               thumbnail:
*                                 type: string
*       401:
*         description: Unauthorized
*       500:
*         description: Gemini API configuration error or failure
*/
router.get('/ai-recommendation', authMiddleware, postController.getAiRecommendation);

router.post('/', authMiddleware, postController.addPost);

/**
* @swagger
* /post:
*   get:
*     summary: Get all posts with pagination
*     tags: [Posts]
*     parameters:
*       - in: query
*         name: sender
*         schema:
*           type: string
*         description: Filter by sender id
*       - in: query
*         name: page
*         schema:
*           type: number
*           default: 1
*         description: Page number for pagination
*       - in: query
*         name: limit
*         schema:
*           type: number
*           default: 10
*         description: Number of posts per page
*     responses:
*       200:
*         description: The list of posts with pagination info
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 posts:
*                   type: array
*                   items:
*                     $ref: '#/components/schemas/Post'
*                 currentPage:
*                   type: number
*                 totalPages:
*                   type: number
*                 totalPosts:
*                   type: number
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
* /post/user/{userId}:
*   get:
*     summary: Get all posts by a specific user with pagination
*     tags: [Posts]
*     parameters:
*       - in: path
*         name: userId
*         schema:
*           type: string
*         required: true
*         description: The user id
*       - in: query
*         name: page
*         schema:
*           type: number
*           default: 1
*         description: Page number for pagination
*       - in: query
*         name: limit
*         schema:
*           type: number
*           default: 10
*         description: Number of posts per page
*     responses:
*       200:
*         description: The list of posts for the specific user with pagination info
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 posts:
*                   type: array
*                   items:
*                     $ref: '#/components/schemas/Post'
*                 currentPage:
*                   type: number
*                 totalPages:
*                   type: number
*                 totalPosts:
*                   type: number
*       400:
*         description: Error retrieving posts
*/
router.get('/user/:userId', postController.getPostsByUserId);

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
*               bookTitle:
*                 type: string
*               bookAuthor:
*                 type: string
*               bookDescription:
*                 type: string
*               bookImage:
*                 type: string
*               userImage:
*                 type: string
*               recommendation:
*                 type: string
*               rating:
*                 type: number
*     responses:
*       200:
*         description: The post was updated
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/Post'
*       404:
*         description: The post was not found
*       403:
*         description: Unauthorized to update this post
*/
router.put('/:id', authMiddleware, postController.updatePost);

/**
* @swagger
* /post/{id}:
*   delete:
*     summary: Delete the post by id
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
*     responses:
*       200:
*         description: The post was deleted
*       404:
*         description: The post was not found
*       403:
*         description: Unauthorized to delete this post
*/
router.delete('/:id', authMiddleware, postController.deletePost);

export default router;
