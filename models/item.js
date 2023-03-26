"use strict";

const db = require('../db');
const { BadRequestError, NotFoundError } = require('../expressError');

/** Related functions for menu items.  */

class Item {
    /** Find all menu items.
     * 
     *  Returns [{ item_name, item_desc, item_price, category }, ...]
     */

    static async findAll(){
        let result = await db.query(
            `SELECT item_name AS "itemName",
                    item_desc AS "itemDesc",
                    item_price AS "itemPrice",
                    category
             FROM items`
        );
        return result.rows;
    }
    
}

module.exports = Item;