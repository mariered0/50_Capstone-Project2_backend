"use strict";

const db = require('../db');
const { BadRequestError, NotFoundError } = require('../expressError');

/** Related functions for menu category.  */

class Category {
    /** Find all items in the category
     * 
     *  Returns [{ id, itemName, itemDesc, itemPrice }, ...]
     */

    static async get(category){
        //check category_id first
        const catIdRes = await db.query(
            `SELECT id, 
                    category_name AS "categoryName"
             FROM categories
             WHERE category_name = $1`,
            [category]);
        

        if (!catIdRes.rows[0]) throw new NotFoundError(`No category: ${category}`);
        const catId = catIdRes.rows[0].id;

        const result = await db.query(
                `SELECT id,
                        item_name AS "itemName",
                        item_desc AS "itemDesc",
                        item_price AS "itemPrice"
                 FROM items
                 WHERE category_id = $1`,
            [catId]);
        const items = result.rows;

        return items;
    }

     /** Find all categories
     * 
     *  Returns [ { categoryName: category },... ]}
     */

    static async findAll(){
        const result = await db.query(
            `SELECT category_name AS "categoryName"
             FROM categories
             ORDER BY category_name`
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
            `SELECT category_name AS categoryName
             FROM categories
             WHERE category_name = $1`,
            [categoryName]);

        if (duplicateCheck.rows[0]) throw new BadRequestError(`Duplicate category: ${categoryName}`);

        const result = await db.query(
            `INSERT INTO categories
             (category_name)
             VALUES ($1)
             RETURNING category_name AS "categoryName"`,
             [categoryName]);
        const category = result.rows[0];
        
        return category;
    }

    /** Update a category
     * 
     *  Returns updated category name.
     */

    static async update(categoryName, data){

        const check = await db.query(`
            SELECT category_name AS "categoryName"
            FROM categories
            WHERE category_name = $1`,
            [categoryName]);
        
        if(check.rows.length === 0) throw new NotFoundError(`No category: ${categoryName}`);

        const result = await db.query(`
            UPDATE categories 
            SET category_name = $1
            WHERE category_name = $2
            RETURNING category_name AS "categoryName"`,
            [data, categoryName]);

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
