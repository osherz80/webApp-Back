import express from 'express';
const router = express.Router();
import commentController from '../controllers/commentController';
import authMiddleware from '../middleware/authMiddleware';

/**
* @swagger
* tags:
*   name: Comments
*   description: The Comments API
*/

/**
* @swagger
* components:
*   schemas:
*     Comment:
*       type: object
*       required:
*         - message
*         - sender
*         - postId
*       properties:
*         _id:
*           type: string
*           description: The auto-generated id of the comment
*         message:
*           type: string
*           description: The message of the comment
*         sender:
*           type: string
*           description: The sender id
*         postId:
*           type: string
*           description: The post id
*       example:
*         _id: 23423432423
*         message: Nice post!
*         sender: 23423432423
*         postId: 23423432423
*/

/**
* @swagger
* /comments:
*   post:
*     summary: Create a new comment
*     tags: [Comments]
*     security:
*       - bearerAuth: []
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - message
*               - postId
*             properties:
*               message:
*                 type: string
*               postId:
*                 type: string
*     responses:
*       201:
*         description: The comment was created
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/Comment'
*       400:
*         description: Comment creation failed
*/
router.post('/', authMiddleware, commentController.addComment);

/**
* @swagger
* /comments:
*   get:
*     summary: Get all comments
*     tags: [Comments]
*     parameters:
*       - in: query
*         name: postId
*         schema:
*           type: string
*         description: The post id to filter by
*     responses:
*       200:
*         description: The list of comments
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                 $ref: '#/components/schemas/Comment'
*/
router.get('/', commentController.getAllComments);

/**
* @swagger
* /comments/{id}:
*   get:
*     summary: Get the comment by id
*     tags: [Comments]
*     parameters:
*       - in: path
*         name: id
*         schema:
*           type: string
*         required: true
*         description: The comment id
*     responses:
*       200:
*         description: The comment description by id
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/Comment'
*       404:
*         description: The comment was not found
*/
router.get('/:id', commentController.getCommentById);

/**
* @swagger
* /comments/{id}:
*   put:
*     summary: Update the comment by id
*     tags: [Comments]
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: path
*         name: id
*         schema:
*           type: string
*         required: true
*         description: The comment id
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               message:
*                 type: string
*     responses:
*       200:
*         description: The comment was updated
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/Comment'
*       404:
*         description: The comment was not found
*/
router.put('/:id', authMiddleware, commentController.updateComment);

/**
* @swagger
* /comments/{id}:
*   delete:
*     summary: Delete the comment by id
*     tags: [Comments]
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: path
*         name: id
*         schema:
*           type: string
*         required: true
*         description: The comment id
*     responses:
*       200:
*         description: The comment was deleted
*       404:
*         description: The comment was not found
*/
router.delete('/:id', authMiddleware, commentController.deleteComment);

export default router;
