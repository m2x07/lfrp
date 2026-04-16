import crypto from 'node:crypto';

const EXTENSION_MAP: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
};

export function hashFile(buffer: Buffer, mimetype: string): string {
    const hash = crypto
        .createHash('sha256')
        .update(buffer)
        .digest('hex')
        .slice(0, 16);
    const ext = EXTENSION_MAP[mimetype];
    if (!ext) {
        throw new Error(`Unsupported mimetype: ${mimetype}`);
    }
    return `${hash}.${ext}`;
}
