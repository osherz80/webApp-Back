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

dotenv.config();

const app = express();
const port = process.env.NODE_ENV === 'production' ? 443 : (process.env.PORT || 80);

const isProduction = __dirname.includes('dist');
const frontendDistPath = isProduction
    ? path.join(__dirname, '..', '..', 'webApp-Front', 'dist')
    : path.join(__dirname, '..', 'webApp-Front', 'dist');

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

app.use(express.static(frontendDistPath));

const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

app.use('/post', postRoutes);
app.use('/comments', commentRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/file', fileRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.get(/.*/, (req, res) => {
    const indexPath = path.join(frontendDistPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Frontend build not found. Please run npm run build in the frontend folder.');
    }
});

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