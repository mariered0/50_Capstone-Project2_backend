"use strict";

const db = require('../db');
const { BadRequestError, NotFoundError } = require('../expressError');

/** Related functions for menu category.  */

class Category {
    /** Find all items in the category
     * 
     *  Returns [{ itemName, itemDesc, itemPrice }, ...]
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
     *  Returns [ { category_name: category },... ]}
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
        const category = result.rows[0];
        
        return category;
    }

    /** Update a category
     * 
     *  Returns updated category name.
     */

    static async update(categoryName){

        
        const category = await db.query(`
            SELECT category_name
            FROM categories
            WHERE category_name = $1`,
            [categoryName]);
        
        if(category.rows[0] || categoryName === '') throw new BadRequestError(`Duplicate category: ${categoryName}`);

        const result = await db.query(`
            INSERT INTO categories
            (category_name)
            VALUES ($1)
            RETURNING category_name`,
            [categoryName]);

        const updatedCategory = result.rows[0];

        return updatedCategory;
    }

    /** Delete the category from database
     *  Returns undefined
     * 
     *  Throws NotFound Error if category is not found.
     */

    static async remove(category_name) {
        const result = await db.query(
            `DELETE
             FROM categories
             WHERE category_name = $1
             RETURNING category_name`,
            [category_name]);
        const category = result.rows[0];

        if (!category) throw new NotFoundError(`No category: ${category_name}`);
    };
}


module.exports = Category;
