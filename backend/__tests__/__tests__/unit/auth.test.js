const jwt = require('jsonwebtoken');
const { authMiddleware, JWT_SECRET } = require('../../src/middleware/auth');

describe('authMiddleware', () => {
    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
        mockReq = { headers: {} };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        mockNext = jest.fn();
    });

    test('should return 401 if no authorization header', () => {
        authMiddleware(mockReq, mockRes, mockNext);
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Access denied. No token provided.' });
        expect(mockNext).not.toHaveBeenCalled();
    });

    test('should return 401 if authorization header does not start with Bearer', () => {
        mockReq.headers.authorization = 'Basic sometoken';
        authMiddleware(mockReq, mockRes, mockNext);
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockNext).not.toHaveBeenCalled();
    });

    test('should return 403 for invalid token', () => {
        mockReq.headers.authorization = 'Bearer invalidtoken';
        authMiddleware(mockReq, mockRes, mockNext);
        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid or expired token.' });
        expect(mockNext).not.toHaveBeenCalled();
    });

    test('should call next() and set req.user for valid token', () => {
        const payload = { username: 'admin', role: 'admin' };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
        mockReq.headers.authorization = `Bearer ${token}`;

        authMiddleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockReq.user).toBeDefined();
        expect(mockReq.user.username).toBe('admin');
        expect(mockReq.user.role).toBe('admin');
    });

    test('should return 403 for expired token', () => {
        const payload = { username: 'admin', role: 'admin' };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '0s' });
        mockReq.headers.authorization = `Bearer ${token}`;

        // Wait a tick for expiration
        setTimeout(() => {
            authMiddleware(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockNext).not.toHaveBeenCalled();
        }, 100);
    });
});
