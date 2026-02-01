import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const generateAccessToken = (payload: object) => {
    return jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET as string, { expiresIn: '15m'});
}

const generateRefreshToken = (payload: object) => {
    return jwt.sign(payload, process.env.JWT_REFRESH_TOKEN_SECRET as string, { expiresIn: '1d'});
}

const hashToken = (token: string): string => {
    return crypto.createHash('sha256').update(token).digest('hex');
}

export { generateAccessToken, generateRefreshToken, hashToken };