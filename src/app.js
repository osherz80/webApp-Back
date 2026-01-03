const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
const postRoutes = require('./routes/postRoutes');
app.use('/post', postRoutes);

// Basic Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch((err) => {
        console.error('Could not connect to MongoDB', err);
    });
