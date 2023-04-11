"use strict";

const db = require('../db');
const { BadRequestError, NotFoundError } = require('../expressError');

/** Related functions for menu category.  */

class Category {
    /** Find all items in the category
     * 
     *  Returns { items: [{ itemName, itemDesc, itemPrice }, ...]}
     */

    static async get(category){
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

    /** Create a new category 
     * 
     *  Returns { created: category_name }
     */

    static async create(categoryName){
        const duplicateCheck = await db.query(
            `SELECT category_name
             FROM categories
             WHERE category_name = $1`,
            [categoryName]);

        if (duplicateCheck.rows[0]) throw new BadRequestError(`Duplicate category: ${categoryName}`);

        const result = await db.query(
            `INSERT INTO categories
             (category_name)
             VALUES ($1)
             RETURNING category_name`,
             [categoryName]);

        const newCategory = result.rows[0];
        
        return newCategory;
    }

    /** Update a category
     * 
     *  Returns 
     */

    static async update(categoryName){
        console.log(categoryName)
        const category = await db.query(`
            SELECT category_name
            FROM categories
            WHERE category_name = $1`,
            [categoryName]);

        console.log('category', category);
        
        if(category.rows[0]) throw new BadRequestError(`Duplicate category: ${categoryName}`);

        const result = await db.query(`
            INSERT INTO categories
            (category_name)
            VALUES ($1)
            RETURNING category_name`,
            [categoryName]);

        const updatedCategory = result.rows[0];

        return updatedCategory;
    }
}


module.exports = Category;
