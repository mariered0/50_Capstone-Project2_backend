"use strict";

const request = require("supertest");

const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /auth/token */

describe("POST /auth/token", () => {
    test('works', async() => {
        const resp = await request(app)
            .post('/auth/token')
            .send({
                username: 'test1',
                password: '123456'
            });
    expect(resp.body).toEqual({
        "token": expect.any(String)
        });
    });

    test('unauth error with invalid user', async () => {
        const resp = await request(app)
            .post('/auth/token')
            .send({
                username: 'test9',
                password: '0000'
            });
        expect(resp.statusCode).toEqual(401);
    });

    test('unauth error with invalid password', async () => {
        const resp = await request(app)
            .post('/auth/token')
            .send({
                username: 'test1',
                password: '0000'
            });
        expect(resp.statusCode).toEqual(401);
    });

    test('bad request error with missing data', async () => {
        const resp = await request(app)
            .post('/auth/token')
            .send({
                username: 'test1'
            });
        expect(resp.statusCode).toEqual(400);
    });

    test('bad request error with invalid data', async () => {
        const resp = await request(app)
            .post('/auth/token')
            .send({
                username: 12345,
                password: 'abcdef'
            });
        expect(resp.statusCode).toEqual(400);
    });
});

/************************************** POST /auth/register */

describe('POST /auth/register', function (){
    test('works', async () => {
        const resp = await request(app)
            .post('/auth/register')
            .send({
                username: 'test_new',
                firstName: 'first',
                lastName: 'last',
                password: "123456",
                email: 'test@gmail.com',
                phone: '0000000000',
                isAdmin: false
            });
        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            "token": expect.any(String)
        });
    });

    test('bad request error with missing fields', async () => {
        const resp = await request(app)
            .post('/auth/register')
            .send({
                username: 'test'
            });
        expect(resp.statusCode).toEqual(400);
    });

    // it should return `constraint \"users_email_check\"`
    test('bad request with invalid email', async () => {
        const resp = await request(app)
            .post('/auth/register')
            .send({
                username: 'new',
                firstName: 'first',
                lastName: 'last',
                password: "123456",
                email: 'testgmail.com',
                phone: '0000000000',
                isAdmin: false
            });
        expect(resp.statusCode).toEqual(500);
    });


})
