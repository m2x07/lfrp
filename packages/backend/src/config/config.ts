import dotenv from 'dotenv';

dotenv.config();

interface Config {
    port: number;
    nodeEnv: string;
    jwtSecret: string;
    smtpUser: string;
    smtpPass: string;
}

const config: Config = {
    port: Number(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || '',
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
};

export default config;
