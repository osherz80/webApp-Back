import express from 'express';
const router = express.Router();
import userController from '../controllers/userController';
import authMiddleware from '../middleware/authMiddleware';

/**
* @swagger
* tags:
*   name: Users
*   description: The Users API
*/

/**
* @swagger
* components:
*   schemas:
*     User:
*       type: object
*       required:
*         - _id
*         - email
*         - username
*       properties:
*         _id:
*           type: string
*           description: The auto-generated id of the user
*         email:
*           type: string
*           description: The email of the user
*         username:
*           type: string
*           description: The username of the user
*       example:
*         _id: 23423432423
*         email: bob@example.com
*         username: bob
*/

/**
* @swagger
* /user/{id}:
*   get:
*     summary: Get the user by id
*     tags: [Users]
*     parameters:
*       - in: path
*         name: id
*         schema:
*           type: string
*         required: true
*         description: The user id
*     responses:
*       200:
*         description: The user description by id
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/User'
*       404:
*         description: The user was not found
*/
/**
* @swagger
* /user:
*   get:
*     summary: Get all users
*     tags: [Users]
*     responses:
*       200:
*         description: The list of users
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                 $ref: '#/components/schemas/User'
*/
router.get('/', userController.getAllUsers);

router.get('/:id', authMiddleware, userController.getUserById);

export default router;