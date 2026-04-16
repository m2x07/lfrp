import nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import config from '../config/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
    },
});

function loadTemplate(filename: string): string {
    const templatePath = join(__dirname, '..', 'templates', filename);
    return readFileSync(templatePath, 'utf-8');
}

export async function sendMagicLink(email: string, token: string) {
    const frontendUrl = process.env.AUTH_VERIFY_URL || 'http://localhost:3000';
    const magicLink = `${frontendUrl}/api/auth/verify?token=${token}`;

    const html = loadTemplate('magic-link.html').replace(
        '{{MAGIC_LINK_URL}}',
        magicLink
    );

    await transporter.sendMail({
        from: `"LFRP" <${config.smtpUser}>`,
        to: email,
        subject: 'Welcome to LFRP',
        html,
    });
}
