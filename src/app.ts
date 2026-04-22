import express from 'express';
import mongoose from 'mongoose';
import fs from 'fs';
import dotenv from 'dotenv';
import https from 'https';
import forge from 'node-forge';
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
import { fileURLToPath } from 'url'; // הוספת ייבוא לטיפול בנתיבים

dotenv.config();

const app = express();
// חובה להשתמש בפורט 443 עבור HTTPS ללא פורט ב-URL
const port = process.env.NODE_ENV === 'production' ? 443 : (process.env.PORT || 80);

const frontendDistPath = path.join(__dirname, '..', '..', 'webApp-Front', 'dist');

app.use(cors({
    origin: [
        'https://node14.cs.colman.ac.il',
        'http://node14.cs.colman.ac.il',
        'https://localhost',
        'http://localhost'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

// 1. הגשת קבצים סטטיים של הפרונטנד (חובה לפני ה-API)
app.use(express.static(frontendDistPath));

// 2. הגדרת תיקיית העלאות (Uploads)
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// 3. API Routes
app.use('/post', postRoutes);
app.use('/comments', commentRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/file', fileRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// 4. Fallback: כל בקשה שלא נענתה ע"י ה-API, תחזיר את ה-index.html של ה-React
// זה מה שמאפשר ל-React Router לעבוד וגם מגיש את האתר ב-URL הראשי
app.get(/.*/, (req, res) => {
    // בודקים אם הקובץ קיים לפני ששולחים (מונע לופים במקרה של תקלה בבילד)
    const indexPath = path.join(frontendDistPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Frontend build not found. Please run npm run build in the frontend folder.');
    }
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

        let credentials: { key: string, cert: string };
        const keyPath = '/home/node14/key.pem';
        const certPath = '/home/node14/cert.pem';

        if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
            credentials = {
                key: fs.readFileSync(keyPath, 'utf8'),
                cert: fs.readFileSync(certPath, 'utf8')
            };
        } else {
            // לוגיקת יצירת התעודה שלך נשארת כאן...
            // (השארתי את זה כפי שהיה בקוד המקור שלך)
            console.log('Generating self-signed certificate...');
            const pki = forge.pki;
            const keys = pki.rsa.generateKeyPair(2048);
            const cert = pki.createCertificate();
            cert.publicKey = keys.publicKey;
            cert.serialNumber = '01';
            cert.validity.notBefore = new Date();
            cert.validity.notAfter = new Date();
            cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
            const attrs = [{ name: 'commonName', value: 'node14.cs.colman.ac.il' }];
            cert.setSubject(attrs);
            cert.setIssuer(attrs);
            cert.sign(keys.privateKey, forge.md.sha256.create());
            credentials = {
                key: pki.privateKeyToPem(keys.privateKey),
                cert: pki.certificateToPem(cert)
            };
        }

        if (process.env.NODE_ENV !== 'test') {
            https.createServer(credentials, app).listen(port, () => {
                console.log(`HTTPS Production Server is running on port ${port}`);
            });
        }
    })
    .catch((err) => {
        console.error('Could not connect to mongo', err);
    });

export default app;