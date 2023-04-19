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

/************************************** GET /items */

describe('GET /items', function () {
    test('works with anon', async () => {
        const resp = await request(app).get('/items');
        expect(resp.body).toEqual({
            items: [{
                itemName: "item1", 
                itemDesc: "item item item", 
                itemPrice: "18.95", 
                category: "cat1"
            },
            {
                itemName: "item2", 
                itemDesc: "item item item", 
                itemPrice: "18.95", 
                category: "cat2"
            }]
        });
    });
})

/************************************** GET /items/:itemName */

describe('GET /items/:itemName', function(){
    test('works with anon', async () => {
        const resp = await request(app).get(`/items/item1`);
        expect(resp.body).toEqual({
            item: {
                    itemName: "item1", 
                    itemDesc: "item item item", 
                    itemPrice: "18.95", 
                    category: "cat1"
                }
        });
    });

    test('not found error if no such item', async () => {
        const resp = await request(app).get(`/items/no`);
        expect(resp.statusCode).toEqual(404);
    });
});

/************************************** POST /items */

describe('POST /items', function() {
    const newItem = {
        itemName: "new", 
        itemDesc: "item item item", 
        itemPrice: "18.95", 
        category: "cat1"
    };

    test('works with admin', async () => {
        const resp = await request(app)
            .post('/items')
            .send({item: newItem})
            .set('authorization', `Bearer ${test_adminToken}`);
        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            item: newItem
        });
    });

    test('unauth error with non-admin', async () => {
        const resp = await request(app)
            .post('/items')
            .send({item: newItem})
            .set('authorization', `Bearer ${test1Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test('bad request error with missing data', async () => {
        const resp = await request(app)
            .post('/items')
            .send({item: {
                itemName: "new", 
                itemDesc: "item item item", 
                itemPrice: "18.95", 
            }})
            .set('authorization', `Bearer ${test_adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });

    test('bad request with invalid data', async () => {
        const resp = await request(app)
            .post('/items')
            .send({item: {
                itemName: "new", 
                itemDesc: "item item item", 
                itemPrice: "18.95",
                category: "cat99" 
            }})
            .set('authorization', `Bearer ${test_adminToken}`);
        expect(resp.statusCode).toEqual(400);
    })
})

/************************************** PATCH /items/:itemName */

describe('PATCH /items/:itemName', function(){
    test('works with admin', async () => {
        const resp = await request(app)
            .patch(`/items/item1`)
            .send({ 
                itemName: "item_updated",
                itemDesc: "item item item", 
                itemPrice: "18.95", 
                category: "cat1" 
            })
            .set('authorization', `Bearer ${test_adminToken}`);
        // expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            item: { 
                itemName: "item_updated", 
                itemDesc: "item item item", 
                itemPrice: "18.95", 
                category: "cat1" }
        });
    })
})

/************************************** DELETE /items/:itemName */
