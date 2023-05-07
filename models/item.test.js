"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Item = require("./item.js");
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

/************************************** create */

describe("create", () => {
  const newItem = {
    itemName: "new",
    itemDesc: "new new new",
    itemPrice: "18.95",
    category: "cat1",
  };

  test("works", async () => {
    let item = await Item.create(newItem);
    expect(item).toEqual({
      id: expect.any(Number),
      itemName: "new",
      itemDesc: "new new new",
      itemPrice: "18.95",
      categoryId: expect.any(Number),
    });

    const result = await db.query(
      `SELECT item_name AS "itemName", 
              item_desc AS "itemDesc", 
              item_price AS "itemPrice", 
              category_id AS "categoryId"
       FROM items
       WHERE item_name = 'new'`
    );

    expect(result.rows).toEqual([
      {
        itemName: "new",
        itemDesc: "new new new",
        itemPrice: "18.95",
        categoryId: expect.any(Number)
      },
    ]);
  });

  test("bad request with dupliate item name", async () => {
    try {
      //making duplicate
      await Item.create(newItem);
      //check duplicate
      await Item.create(newItem);
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", () => {
  test("works", async () => {
    const items = await Item.findAll();
    expect(items).toEqual([
      {
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
      },
    ]);
  });
});

/************************************** get */

describe('get', () => {
    test('works', async () => {
        const item = await Item.get('item1');
        expect(item).toEqual({
            id: expect.any(Number),
            itemName: "item1",
            itemDesc: "item item item",
            itemPrice: "18.95",
            categoryName: "cat1"
        })
    });

    test('invalid itemName', async () => {
        try{
            await Item.get('item10');
        } catch (err){
            expect (err instanceof NotFoundError).toBeTruthy();
        }
    });

})

/************************************** update */

describe('update', () => {
    const updateData = {
        itemName: 'item1_updated',
        itemDesc: 'item item updated'
    };

    test('works when only two fields are filled', async () => {
        const item = await Item.update('item1', updateData);
        expect(item).toEqual({
            itemName: 'item1_updated',
            itemDesc: 'item item updated',
            itemPrice: '18.95',
            categoryId: expect.any(Number)
        });

        const result = await db.query(
            `SELECT item_name, 
                    item_desc, 
                    item_price, 
                    category_id
             FROM items
             WHERE item_name = 'item1_updated'`);
        expect(result.rows).toEqual([{
            item_name: 'item1_updated',
            item_desc: 'item item updated',
            item_price: '18.95',
            category_id: expect.any(Number)
        }])
    })

    test('bad request error when invalid item name is entered', async () => {
        try{
            await Item.update('na', updateData);
        }catch(err){
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    test('bad request error with no data', async () => {
        try{
            await Item.update('item1', {});
        }catch(err){
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
})

/************************************** remove */

describe('remove', () => {
    test('works', async () => {
        await Item.remove('item1');
        const res = await db.query(
            `SELECT item_name 
             FROM items
             WHERE item_name = 'item1'`);
        expect(res.rows.length).toEqual(0);
    })

    test('not found error with invalid item name', async () => {
        try{
            await Item.remove('na');
        }catch(err){
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
})
