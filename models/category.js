"use strict";

const db = require('../db');
const { BadRequestError, NotFoundError } = require('../expressError');

/** Related functions for menu category.  */

class Category {
    /** Find all items in the category
     * 
     *  Returns { items: [{ itemName, itemDesc, itemPrice }, ...]}
     */

    static async findItems(category){
        const result = await db.query(
                `SELECT item_name AS "itemName",
                        item_desc AS "itemDesc",
                        item_price AS "itemPrice",
                        category
                 FROM items
                 WHERE category = $1`,
            [category]);
        const items = result.rows;

        if (!items) throw new NotFoundError(`No category: ${category}`);

        return items;
    }

     /** Find all categories
     * 
     *  Returns [ { category_name },... ]}
     */

    static async findAll(){
        const result = await db.query(
            `SELECT category_name
             FROM categories`
        );
        const categories = result.rows;
        return categories
    }
}


module.exports = Category;
