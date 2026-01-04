import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import postRoutes from './routes/postRoutes.js';
import commentRoutes from './routes/commentRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/post', postRoutes);
app.use('/comments', commentRoutes);

// Basic Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Database Connection
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
    console.error('mongoUri is bad exiting');
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
