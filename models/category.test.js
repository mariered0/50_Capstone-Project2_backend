"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Category = require("./category.js");
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

/************************************** get */

describe('get', function () {
    test('works', async () => {
        const category = await Category.get('cat1');
        expect(category).toEqual([{
            id: expect.any(Number),
            itemName: 'item1',
            itemDesc: 'item item item', 
            itemPrice: '18.95'
        }]);
    });

    test('not found if no such category', async () => {
        try{
            await Category.get('no');
        }catch(err){
            expect(err instanceof NotFoundError).toBeTruthy();
        }  
    });
})

/************************************** findAll */

describe('findAll', function () {
    test('works', async () => {
        const categories = await Category.findAll();
        expect(categories).toEqual([
            {
                categoryName: 'cat1'
            },
            {
                categoryName: 'cat2'
            },
            {
                categoryName: 'cat3'
            }
        ]);
    });
})

/************************************** create */

describe('create', function () {
    const newCategory = 'test_new'

    test('works', async () => {
        const category = await Category.create(newCategory);
        expect(category).toEqual({
            categoryName: 'test_new'
        });
    });

    test('bad request with duplicate', async () => {
        try{
            await Category.create(newCategory);
            await Category.create(newCategory);
        }catch(err){
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

/************************************** update */

describe('update', function () {
    const categoryToUpdate = 'cat3'
    const updateData = 'test_updated';

    test('works', async () => {
        const category = await Category.update(categoryToUpdate, updateData);
        expect(category).toEqual({
            categoryName: 'test_updated'
        });
    });

    test('not found error if no such category', async () => {
        try{
            await Category.update('no', updateData);
        }catch(err){
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    test('bad request error with no data', async () => {
        try{
            await Category.update(categoryToUpdate, '');
        }catch(err){
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
})

/************************************** remove */

describe('remove', function () {
    test('works', async () => {
        //create a new category that has no menu items belong to.
        await Category.create('newCategory');
        const check1 = await db.query(
            `SELECT category_name AS "categoryName"
             FROM categories
             WHERE category_name = 'newCategory'`);
        //check if the new category is created.
        expect(check1.rows.length).toEqual(1);

        await Category.remove('newCategory');
        const res = await db.query(
            `SELECT category_name AS "categoryName"
             FROM categories
             WHERE category_name = 'newCategory'`);
        expect(res.rows.length).toEqual(0);
    });

    test('not found error if no such category', async () => {
        try{
            await Category.remove('no');
        }catch(err){
            expect(err instanceof NotFoundError).toBeTruthy();
        };
    });
})