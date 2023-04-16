"use strict";

const request = require("supertest");

const app = require("../app");

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

/************************************** GET /categories/:category */

describe('GET /categories/:category', function () {
    test('works with anon', async () => {
        const resp = await request(app)
            .get(`/categories/cat1`);
        expect(resp.body).toEqual({
            items: [{
                itemName: "item1",
                itemDesc: "item item item",
                itemPrice: "18.95",
                category: "cat1"
            }]
        });
    });
});


/************************************** GET /categories */

describe("GET /categories", function () {
    test('works with anon', async () => {
        const resp = await request(app)
            .get('/categories');
        expect(resp.body).toEqual({
            categories: [{
                category_name: "cat1"
            },
            {
                category_name: "cat2"
            }]
        });
    });
});


/************************************** POST /categories */

describe("POST /categories", function () {
    const newCategory = {
        categoryName: "cat_new"
    };

    test('works for admin', async () => {
        const resp = await request(app)
            .post('/categories')
            .send(newCategory)
            .set('authorization', `Bearer ${test_adminToken}`);
        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            categoryName: "cat_new"
        });
    });

    test('unauth error for non-admin', async () => {
        const resp = await request(app)
            .post('/categories')
            .send(newCategory)
            .set('authorization', `Bearer ${test1Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test('bad request with missing field', async() => {
        const resp = await request(app)
            .post('/categories')
            .send({ })
            .set('authorization', `Bearer ${test_adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });

    test('bad request with invalid data', async() => {
        const resp = await request(app)
            .post('/categories')
            .send({
                newCategory: 123456
            })
            .set('authorization', `Bearer ${test_adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });
});

/************************************** PATCH /categories/:category */

describe('PATCH /categories/:category', function () {
    test('works with admin',  async () => {
        const resp = await request(app)
            .patch(`/categories/cat1`)
            .send({
                categoryName: 'cat1_updated'
            })
            .set("authorization", `Bearer ${test_adminToken}`);
        expect(resp.body).toEqual({
            category_name: "cat1_updated"
        });
    })
})