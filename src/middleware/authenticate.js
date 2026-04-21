import jwt from 'jsonwebtoken';

export function authenticate(req, res, next) {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
        const err = new Error('Server misconfigured: JWT_SECRET is missing');
        err.status = 500;
        return next(err);
    }

    const err = new Error('Not authenticated. Please provide a valid token.');

    err.status = 401;

    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(err);

    }

    const token = authHeader.split(' ')[1]
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = {id: payload.id, role: payload.role };
        next();
    }catch(error) {
        return next(err);
    }
}
