import express from 'express';
const router = express.Router();
import authController from '../controllers/authController';

/**
* @swagger
* tags:
*   name: Auth
*   description: The Authentication API
*/

/**
* @swagger
* /auth/register:
*   post:
*     summary: Register a new user
*     tags: [Auth]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - email
*               - password
*               - username
*             properties:
*               email:
*                 type: string
*               password:
*                 type: string
*               username:
*                 type: string
*     responses:
*       200:
*         description: User registered successfully
*       400:
*         description: Registration failed
*/
router.post('/register', authController.register);

/**
* @swagger
* /auth/login:
*   post:
*     summary: Login a user
*     tags: [Auth]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - email
*               - password
*             properties:
*               email:
*                 type: string
*               password:
*                 type: string
*     responses:
*       200:
*         description: Login successful
*       400:
*         description: Login failed
*/
router.post('/login', authController.login);

/**
* @swagger
* /auth/logout:
*   post:
*     summary: Logout a user
*     tags: [Auth]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - refreshToken
*             properties:
*               refreshToken:
*                 type: string
*     responses:
*       200:
*         description: Logout successful
*       400:
*         description: Logout failed
*/
router.post('/logout', authController.logout);

/**
* @swagger
* /auth/refresh:
*   post:
*     summary: Refresh access token
*     tags: [Auth]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - refreshToken
*             properties:
*               refreshToken:
*                 type: string
*     responses:
*       200:
*         description: Token refreshed
*       400:
*         description: Refresh failed
*/
router.post('/refresh', authController.refresh);

export default router;
