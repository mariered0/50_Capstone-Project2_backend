"use strict";

const db = require('../db');
const { BadRequestError, NotFoundError } = require('../expressError');
const { sqlForPartialUpdate } = require('../helpers/sql');

/** Related functions for menu items.  */

class Item {
    /** Find all menu items.
     * 
     *  Returns {items: [{ id, itemName, itemDesc, itemPrice, categoryName }, ...]}
     * 
     * in order by category name
     */

    static async findAll(){
        const result = await db.query(
            `SELECT i.id,
                    i.item_name AS "itemName",
                    i.item_desc AS "itemDesc",
                    i.item_price AS "itemPrice",
                    c.category_name AS "categoryName"
             FROM items i
             JOIN categories AS c 
             ON c.id = i.category_id
             ORDER BY category_name`
        );

        return result.rows
    }

    /** Find the item with the itemName
     * 
     *  Returns { item: [{id, itemName, itemDesc, itemPrice, categoryName }]}
     */

    static async get(itemName){
        const result = await db.query(
                `SELECT i.id,
                        i.item_name AS "itemName",
                        i.item_desc AS "itemDesc",
                        i.item_price AS "itemPrice",
                        c.category_name AS "categoryName"
                 FROM items i
                 JOIN categories AS c 
                 ON c.id = i.category_id
                 WHERE item_name = $1`,
            [itemName]);
        const item = result.rows[0];

        if(!item) throw new NotFoundError(`No item: ${itemName}`);

        return item;
    }
    
     /** Create a new menu item
     * 
     *  Returns { item: [{ id, itemName, itemDesc, itemPrice, categoryId }]}
     */

     static async create({ itemName, itemDesc, itemPrice, category }){
        //check duplicate with the itemName
        const duplicateCheck = await db.query(
            `SELECT item_name
             FROM items
             WHERE item_name = $1`,
            [itemName]);

        if (duplicateCheck.rows[0])
            throw new BadRequestError(`Duplicate item: ${itemName}`);
       
        //check categoryId
        const categoryIdRes = await db.query(
            `SELECT id, category_name
             FROM categories
             WHERE category_name = $1`,
             [category]);
        
        if (!categoryIdRes.rows[0])
            throw new BadRequestError(`No category: ${category}`);
        
        const categoryId = categoryIdRes.rows[0].id;

        const result = await db.query(
              `INSERT INTO items
               (item_name, item_desc, item_price, category_id)
               VALUES ($1, $2, $3, $4)
               RETURNING item_name AS "itemName", 
                         item_desc AS "itemDesc", 
                         item_price AS "itemPrice", 
                         category_id AS "categoryId"`,
               [itemName,
                itemDesc,
                itemPrice,
                categoryId]);
        const item = result.rows[0];

        return item;
     }

     /** Update given menu item with 'data'
     *  
     *  This can handle partial update - it only updates the provided items.
     * 
     *  Data looks like: {itemName, itemDesc, itemPrice, category (if the category already exists) }
     * 
     *  Returns { item: [{ itemName, itemDesc, itemPrice, category }]}
     * 
     *  Throws NotFoundError if not found.
     */

     static async update(itemName, data){
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {
                itemName: "item_name",
                itemDesc: "item_desc",
                itemPrice: "item_price",
            });

        const itemVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE items
                          SET ${setCols}
                          WHERE item_name = ${itemVarIdx}
                          RETURNING item_name AS "itemName",
                                    item_desc AS "itemDesc",
                                    item_price AS "itemPrice",
                                    category_id AS "categoryId"`;
        const result = await db.query(querySql, [...values, itemName]);
        const item = result.rows[0];

        if (!item) throw new NotFoundError(`No item: ${itemName}`);

        return item;
     }

     /** Delete given menu item from database. 
      * returns { Deleted: [{ itemName, itemDesc, itemPrice, category }]}
      * 
      * Throws NotFoundError if the item not found.
      */

     static async remove(itemName) {
        const result = await db.query(
            `DELETE
             FROM items
             WHERE item_name = $1
             RETURNING item_name, item_desc, item_price, category_id`,
            [itemName]);
        const item = result.rows[0];

        if(!item) throw new NotFoundError(`No item: ${itemName}`);
        return item;
     }
}

module.exports = Item;