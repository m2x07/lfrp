import multer from 'multer';
import config from './config.js';
import { AppError } from '../types.js';

const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp'];

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: config.maxFileSize,
        files: 2,
    },
    fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new AppError(415, `Unsupported file type: ${file.mimetype}`));
        }
    },
});

export default upload;
