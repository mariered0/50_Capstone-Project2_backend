const bcrypt = require('bcrypt');

const db = require('../db.js');
const { BCRYPT_WORK_FACTOR } = require('../config');

async function commonBeforeAll() {
    await db.query('DELETE FROM users');
    await db.query('DELETE FROM items');
    await db.query('DELETE FROM categories');

    //Create dummy data for users
    await db.query(`
    INSERT INTO users(username,
                      password,
                      first_name,
                      last_name,
                      phone,
                      email,
                      is_admin)
    VALUES ('test1', $1, 'test', 'test', '0000000000', 'test@gmail.com', false),
           ('test2', $2, 'test', 'test', '0000000000', 'test@gmail.com', true)
    RETURNING username`,
    [await bcrypt.hash('password', BCRYPT_WORK_FACTOR),
     await bcrypt.hash('password', BCRYPT_WORK_FACTOR)]
    );

    //Create dummy data for categories
    await db.query(`
        INSERT INTO categories(category_name)
        VALUES ('cat1'),
               ('cat2'),
               ('cat3')`);

    //Check the ids for catagories
    const cat1Result = await db.query(`
        SELECT id
        FROM categories
        WHERE category_name = 'cat1'`);
    const cat1Id = cat1Result.rows[0].id;

    const cat2Result = await db.query(`
        SELECT id
        FROM categories
        WHERE category_name = 'cat2'`);
    const cat2Id = cat2Result.rows[0].id;

    //Create dummy data for items
    await db.query(`
        INSERT INTO items(item_name, item_desc, item_price, category_id)
        VALUES ('item1', 'item item item', '18.95', ${cat1Id}),
               ('item2', 'item item item', '18.95', ${cat2Id})`)
}

async function commonBeforeEach() {
    await db.query('BEGIN');
}

async function commonAfterEach() {
    await db.query('ROLLBACK');
}

async function commonAfterAll() {
    await db.end();
}

module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
};