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

// export async function sendRegistrationMail(email: string, otp: number) {
//
//     const html = loadTemplate('verify-account.html').replace(
//         '{{OTP}}',
//         otp.toString()
//     );
//
//     await transporter.sendMail({
//         from: `"LFRP" <${config.smtpUser}>`,
//         to: email,
//         subject: 'Complete your LFRP account registration',
//         html,
//     });
// }

export async function sendLoginOtp(email: string, otp: number) {
    const html = loadTemplate('login-otp.html').replace(
        '{{OTP}}',
        otp.toString()
    )

    await transporter.sendMail({
        from: `"LFRP" <${config.smtpUser}>`,
        to: email,
        subject: 'Your OTP for LFRP login',
        html,
    })
}
