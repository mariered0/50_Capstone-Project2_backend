const jwt = require('jsonwebtoken');
const { createToken } = require('./token');
const { SECRET_KEY } = require('../config');

describe('createToken', () => {
    test('works with non-admin user', () => {
        const token = createToken({ username: 'test', is_admin: false });
        const payload = jwt.verify(token, SECRET_KEY);
        expect(payload).toEqual({
            iat: expect.any(Number),
            username: "test",
            isAdmin: false
        });
    });

    test('works with admin user', () => {
        const token = createToken({ username: 'test', isAdmin: true });
        const payload = jwt.verify(token, SECRET_KEY);
        expect(payload).toEqual({
            iat: expect.any(Number),
            username: "test",
            isAdmin: true
        });
    });

    test('works without admin set (default)', () => {
        const token = createToken({ username: 'test' });
        const payload = jwt.verify(token, SECRET_KEY);
        expect(payload).toEqual({
            iat: expect.any(Number),
            username: "test",
            isAdmin: false
        });
    });
})