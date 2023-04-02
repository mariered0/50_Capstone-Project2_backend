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
    expect(item).toEqual(newItem);

    const result = await db.query(
      `SELECT item_name, item_desc, item_price, category
             FROM items
             WHERE item_name = 'new'`
    );

    expect(result.rows).toEqual([
      {
        item_name: "new",
        item_desc: "new new new",
        item_price: "18.95",
        category: "cat1",
      },
    ]);
  });

  test("bad request with dupliate item name", async () => {
    try {
      await Item.create(newItem);
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
      },
    ]);
  });
});

/************************************** findItem */

describe('findItem', () => {
    test('works', async () => {
        const item = await Item.findItem('item1');
        expect(item).toEqual({
            itemName: "item1",
            itemDesc: "item item item",
            itemPrice: "18.95",
            category: "cat1"
        })
    });

    test('invalid itemName', async () => {
        try{
            await Item.findItem('item10');
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
            category: 'cat1'
        });

        const result = await db.query(
            `SELECT item_name, item_desc, item_price, category
             FROM items
             WHERE item_name = 'item1_updated'`);
        expect(result.rows).toEqual([{
            item_name: 'item1_updated',
            item_desc: 'item item updated',
            item_price: '18.95',
            category: 'cat1'
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
