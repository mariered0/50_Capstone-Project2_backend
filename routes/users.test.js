"use strict";

const request = require("supertest");

const app = require("../app");
const db = require("../db.js");
const User = require('../models/user');
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    test1Token,
    test2Token,
    test_adminToken
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** GET /users */

describe("GET /users", function () {
    test('works with admin', async () => {
        const resp = await request(app)
            .get('/users')
            .set('authorization', `Bearer ${test_adminToken}`);
    expect(resp.body).toEqual({
            users: [
                {
                    username: "test1",
                    firstName: "test",
                    lastName: "test",
                    email: "test@gmail.com",
                    phone: "0000000000",
                    isAdmin: false
                },
                {
                    username: "test2",
                    firstName: "test",
                    lastName: "test",
                    email: "test@gmail.com",
                    phone: "0000000000",
                    isAdmin: false
                },
                {
                    username: "test_admin",
                    firstName: "test",
                    lastName: "test",
                    email: "test@gmail.com",
                    phone: "0000000000",
                    isAdmin: true
                }
            ]
        });
    });

    test('unauth error with non-admin user', async () => {
        const resp = await request(app)
            .get('/users')
            .set('authorization', `Bearer ${test1Token}`)
        expect(resp.statusCode).toEqual(401);
    });

    test('uauth error with anon', async () => {
        const resp = await request(app)
            .get('/users');
        expect(resp.statusCode).toEqual(401);
    });

    test('fails because the process moves onto next() handler', async () => {
        await db.query("DROP TABLE users CASCADE");
        const resp = await request(app)
            .get("/users")
            .set("authorization", `Bearer ${test_adminToken}`);
        expect(resp.statusCode).toEqual(500); 
    })
})

/************************************** GET /users/:username */

describe('GET /users/:username', function () {
    test('works with admin user', async () => {
        const resp = await request(app)
            .get(`/users/test1`)
            .set('authorization', `Bearer ${test_adminToken}`);
        expect(resp.body).toEqual({
            user: {
                username: "test1",
                firstName: "test",
                lastName: "test",
                email: "test@gmail.com",
                phone: "0000000000",
                isAdmin: false,
                favorites: ["item1"]
            }
        });
    });

    test('works for same user', async () => {
        const resp = await request(app)
            .get(`/users/test1`)
            .set('authorization', `Bearer ${test1Token}`);
        expect(resp.body).toEqual({
            user: {
                username: "test1",
                firstName: "test",
                lastName: "test",
                email: "test@gmail.com",
                phone: "0000000000",
                isAdmin: false,
                favorites: ["item1"]
            }
        });
    });

    test('unauth error for other users', async () => {
        const resp = await request(app)
            .get(`/users/test1`)
            .set('authorization', `Bearer ${test2Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test('unauth error for anon', async () => {
        const resp = await request(app)
            .get(`/users/test1`);
        expect(resp.statusCode).toEqual(401);
    });

    test('not found error if the user is not found', async () => {
        const resp = await request(app)
            .get(`/users/no`)
            .set('authorization', `Bearer ${test_adminToken}`);
        expect(resp.statusCode).toEqual(404);
    });
});

/************************************** PATCH /users/:username */

describe('PATCH /users/:username', function () {
    test('works for admin user', async () => {
        const resp = await request(app)
            .patch(`/users/test1`)
            .send({
                "firstName": "test_updated",
                "lastName": "test_updated"
            })
            .set('authorization', `Bearer ${test_adminToken}`);
        expect(resp.body).toEqual({
            user: {
                username: "test1",
                firstName: "test_updated",
                lastName: "test_updated",
                email: "test@gmail.com",
                phone: "0000000000",
                isAdmin: false
            }
        });
    });

    test('works for same user', async () => {
        const resp = await request(app)
            .patch(`/users/test1`)
            .send({
                "firstName": "test_updated",
                "lastName": "test_updated"
            })
            .set('authorization', `Bearer ${test1Token}`);
        expect(resp.body).toEqual({
            user: {
                username: "test1",
                firstName: "test_updated",
                lastName: "test_updated",
                email: "test@gmail.com",
                phone: "0000000000",
                isAdmin: false
            }
        });
    });

    test('uanth error for different user', async () => {
        const resp = await request(app)
            .patch(`/users/test1`)
            .send({
                "firstName": "test_updated",
                "lastName": "test_updated"
            })
            .set('authorization', `Bearer ${test2Token}`);
        expect(resp.statusCode).toEqual(401);
    })

    test('unauth error for anon', async () => {
        const resp = await request(app)
            .patch(`/users/test1`)
            .send({
                "firstName": "test_updated",
                "lastName": "test_updated"
            });
        expect(resp.statusCode).toEqual(401);
    });

    test('not found error with invalid user', async () => {
        const resp = await request(app)
            .patch(`/users/no`)
            .send({
                "firstName": "test_updated",
                "lastName": "test_updated"
            })
            .set('authorization', `Bearer ${test_adminToken}`);
        expect(resp.statusCode).toEqual(404);
    });

    test('bad request if invalid data', async () => {
        const resp = await request(app)
            .patch(`/users/test1`)
            .send({
                "firstName": 123,
                "lastName": 123
            })
            .set('authorization', `Bearer ${test_adminToken}`);
    expect(resp.statusCode).toEqual(400);
    });

    test('works: can set password', async () => {
        const resp = await request(app)
            .patch(`/users/test1`)
            .send({
                "password": "000000"
            })
            .set('authorization', `Bearer ${test1Token}`);
        expect(resp.body).toEqual({
            user: {
                username: "test1",
                firstName: "test",
                lastName: "test",
                email: "test@gmail.com",
                phone: "0000000000",
                isAdmin: false
            }
        });
        const isSuccessful = await User.authenticate('test1', '000000');
        expect(isSuccessful).toBeTruthy();
    });
});


/************************************** DELETE /users/:username */

describe('DELETE /users/:username', function () {
    test('works for admin', async () => {
        const resp = await request(app)
            .delete(`/users/test1`)
            .set('authorization', `Bearer ${test_adminToken}`);
        expect(resp.body).toEqual({ deleted: 'test1'});
    });

    test('works for same user', async () => {
        const resp = await request(app)
            .delete(`/users/test1`)
            .set('authorization', `Bearer ${test1Token}`);
        expect(resp.body).toEqual({ deleted: 'test1'});
    });

    test('unauth error if not the same user', async () => {
        const resp = await request(app)
            .delete(`/users/test1`)
            .set('authorization', `Bearer ${test2Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test('unauth error for anon', async () => {
        const resp = await request(app)
            .delete(`/users/test1`);
        expect(resp.statusCode).toEqual(401);
    });

    test('not found error if invalid user', async () => {
        const resp = await request(app)
            .delete(`/users/no`)
            .set('authorization', `Bearer ${test_adminToken}`)
        expect(resp.statusCode).toEqual(404);
    });
})

/************************************** POST /users/:username/items/:itemName */

describe('POST /users/:username/items/:itemName', function () {
    test('works for admin', async () => {
        const resp = await request(app)
            .post(`/users/test1/items/item2`)
            .set('authorization', `Bearer ${test_adminToken}`);
        expect(resp.body).toEqual({ "favorite": "item2" });
    });

    test('works for same user', async () => {
        const resp = await request(app)
            .post(`/users/test1/items/item2`)
            .set('authorization', `Bearer ${test1Token}`);
        expect(resp.body).toEqual({ "favorite": "item2" });
    });

    test('unauth error for different user', async () => {
        const resp = await request(app)
            .post(`/users/test1/items/item2`)
            .set('authorization', `Bearer ${test2Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test('unauth error for anon', async () => {
        const resp = await request(app)
            .post(`/users/test1/items/item2`);
        expect(resp.statusCode).toEqual(401);
    });

    test('not found error for invalid username', async () => {
        const resp = await request(app)
            .post(`/users/no/items/item2`)
            .set('authorization', `Bearer ${test_adminToken}`);
        expect(resp.statusCode).toEqual(404);
    });

    test('not found error for invalid itemName', async () => {
        const resp = await request(app)
            .post(`/users/test1/items/no`)
            .set('authorization', `Bearer ${test_adminToken}`);
        expect(resp.statusCode).toEqual(404);
    });
});

/************************************** DELETE /users/:username/items/:itemName */

describe('DELETE /users/:username/items/:itemName', function () {
    test('works for admin', async () => {
        const resp = await request(app)
            .delete(`/users/test1/items/item1`)
            .set('authorization', `Bearer ${test_adminToken}`);
        expect(resp.body).toEqual({ "removed": "item1" });
    });

    test('works for same user', async () => {
        const resp = await request(app)
            .delete(`/users/test1/items/item1`)
            .set('authorization', `Bearer ${test1Token}`);
        expect(resp.body).toEqual({ "removed": "item1" });
    });

    test('unauth error for different user', async () => {
        const resp = await request(app)
            .delete(`/users/test1/items/item1`)
            .set('authorization', `Bearer ${test2Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test('unauth error for anon', async () => {
        const resp = await request(app)
            .delete(`/users/test1/items/item1`);
        expect(resp.statusCode).toEqual(401);
    });

    test('not found error for invalid user', async () => {
        const resp = await request(app)
            .delete(`/users/no/items/item1`)
            .set('authorization', `Bearer ${test_adminToken}`);
        expect(resp.statusCode).toEqual(404);
    });
});

