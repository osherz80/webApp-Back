import express from 'express';
import mongoose from 'mongoose';
import fs from 'fs';
import dotenv from 'dotenv';
import postRoutes from './routes/postRoutes';
import commentRoutes from './routes/commentRoutes';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import fileRoutes from './routes/fileRoutes';
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './swaggerConfig';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: 'http://localhost:5173', // כתובת מדויקת (בלי '*' ובלי סלאש בסוף)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve static files
app.use('/uploads', express.static(uploadDir));

// Routes
app.use('/post', postRoutes);
app.use('/comments', commentRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/file', fileRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));


// Basic Route
app.get('/', (req, res) => {
    res.send('API is running...' + (process.env.GOOGLE_CLIENT_ID || ''));
});

// Database Connection
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
    console.error('mongoUri is missing in .env');
    process.exit(1);
}

mongoose.connect(mongoUri)
    .then(() => {
        console.log('Connected to mongo');
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch((err) => {
        console.error('Could not connect to mongo', err);
    });

export default app;
