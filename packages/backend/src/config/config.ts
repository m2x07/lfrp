import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config();

interface Config {
    port: number;
    nodeEnv: string;
    jwtSecret: string;
    smtpUser: string;
    smtpPass: string;
    uploadDir: string;
    maxFileSize: number;
}

const config: Config = {
    port: Number(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || '',
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    uploadDir:
        process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads', 'images'),
    maxFileSize: Number(process.env.MAX_FILE_SIZE) || 15 * 1024 * 1024,
};

export default config;
