"use strict";

const request = require("supertest");

const app = require("../app");
const db = require("../db");

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
                id: expect.any(Number),
                itemName: "item1", 
                itemDesc: "item item item", 
                itemPrice: "18.95", 
                categoryName: "cat1"
            },
            {
                id: expect.any(Number),
                itemName: "item2", 
                itemDesc: "item item item", 
                itemPrice: "18.95", 
                categoryName: "cat2"
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
                    id: expect.any(Number),
                    itemName: "item1", 
                    itemDesc: "item item item", 
                    itemPrice: "18.95", 
                    categoryName: "cat1"
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
        expect(resp.body).toEqual({item: {
            id: expect.any(Number),
            itemName: "new", 
            itemDesc: "item item item", 
            itemPrice: "18.95", 
            categoryId: expect.any(Number)
    }});
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
            })
            .set('authorization', `Bearer ${test_adminToken}`);

        expect(resp.body).toEqual({
            item: { 
                itemName: "item_updated", 
                itemDesc: "item item item", 
                itemPrice: "18.95",
                categoryId: expect.any(Number) }
        });
    });

    test('unauth error with non-admin', async () => {
        const resp = await request(app)
            .patch(`/items/item1`)
            .send({ 
                itemName: "item_updated",
                itemDesc: "item updated", 
                itemPrice: "18.95"
            })
            .set('authorization', `Bearer ${test1Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test('unauth error for anon', async () => {
        const resp = await request(app)
            .patch(`/items/item1`)
            .send({
                itemName: "item_updated",
                itemDesc: "item updated", 
                itemPrice: "18.95"
            });
        expect(resp.statusCode).toEqual(401);
    });

    test('not found error with invalid itemName', async () => {
        const resp = await request(app)
            .patch(`/items/no`)
            .send({
                itemName: "item_updated",
                itemDesc: "item updated", 
                itemPrice: "18.95"
            })
            .set('authorization', `Bearer ${test_adminToken}`);
        expect(resp.statusCode).toEqual(404);
    });

    test('bad request error with category change attempt', async () => {
        const resp = await request(app)
            .patch(`/items/item1`)
            .send({
                categoryId: "000"
            })
            .set('authorization', `Bearer ${test_adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });

    test('bad request error with invalid data', async () => {
        const resp = await request(app)
            .patch(`/items/item1`)
            .send({
                item: "item_updated",
                itemD: "item updated", 
                itemP: "18.95"
            })
            .set('authorization', `Bearer ${test_adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });
})

/************************************** DELETE /items/:itemName */

describe("DELETE /items/:itemName", function () {
    test('works with admin', async () => {
        const resp = await request(app)
            .delete(`/items/item1`)
            .set('authorization', `Bearer ${test_adminToken}`);

        expect(resp.body).toEqual(
            { Deleted: {item: { 
                          itemName: 'item1', 
                          itemDesc: 'item item item', 
                          itemPrice: '18.95', 
                          categoryId: expect.any(Number) }}});
    });

    test('uauth error with non-admin', async () => {
        const resp = await request(app)
            .delete(`/items/item1`)
            .set('authorization', `Bearer ${test1Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test('uanth error with anon', async () => {
        const resp = await request(app)
            .delete(`/items/item1`)
        expect(resp.statusCode).toEqual(401);
    });

    test('not found error with invalid itemName', async () => {
        const resp = await request(app)
            .delete(`/items/no`)
            .set('authorization', `Bearer ${test_adminToken}`);
        expect(resp.statusCode).toEqual(404);
    });
})