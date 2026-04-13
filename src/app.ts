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
const port = process.env.PORT || 80;

app.use(cors({
    origin: ['https://localhost', 
            'https://localhost:80', 
            'https://localhost:443', 
            'http://localhost', 
            'http://localhost:80', 
            'http://10.10.246.14', 
            'https://10.10.246.14'],
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
        
        let credentials: { key: string, cert: string };
        const keyPath = path.join(__dirname, '../../key.pem');
        const certPath = path.join(__dirname, '../../cert.pem');
        
        if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
            credentials = {
                key: fs.readFileSync(keyPath, 'utf8'),
                cert: fs.readFileSync(certPath, 'utf8')
            };
        } else {
            console.log('Generating self-signed certificate...');
            const pki = forge.pki;
            const keys = pki.rsa.generateKeyPair(2048);
            const cert = pki.createCertificate();
            cert.publicKey = keys.publicKey;
            cert.serialNumber = '01';
            cert.validity.notBefore = new Date();
            cert.validity.notAfter = new Date();
            cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
            const attrs = [{ name: 'commonName', value: 'localhost' }];
            cert.setSubject(attrs);
            cert.setIssuer(attrs);
            cert.setExtensions([{
                name: 'subjectAltName',
                altNames: [{ type: 2, value: 'localhost' }, { type: 7, ip: '127.0.0.1' }]
            }]);
            cert.sign(keys.privateKey, forge.md.sha256.create());
            
            const keyPem = pki.privateKeyToPem(keys.privateKey);
            const certPem = pki.certificateToPem(cert);
            
            fs.writeFileSync(keyPath, keyPem);
            fs.writeFileSync(certPath, certPem);
            credentials = { key: keyPem, cert: certPem };
        }

        if (process.env.NODE_ENV !== 'test') {
            https.createServer(credentials, app).listen(port, () => {
                console.log(`HTTPS Server is running on port ${port}`);
            });
        }
    })
    .catch((err) => {
        console.error('Could not connect to mongo', err);
    });

export default app;
