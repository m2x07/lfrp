import { Request } from 'express';

export interface MyTokenPayload {
    email: string;
    role: string;
}

export interface AppRequest extends Request {
    user: MyTokenPayload;
}

export class AppError extends Error {
    public status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
        Error.captureStackTrace(this, this.constructor);
    }
}
