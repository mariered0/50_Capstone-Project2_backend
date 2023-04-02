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
           ('test2', $2, 'test', 'test', '0000000000', 'test@gmail.com', false)
    RETURNING username`,
    [await bcrypt.hash('password', BCRYPT_WORK_FACTOR),
     await bcrypt.hash('password', BCRYPT_WORK_FACTOR)]
    );

    //Create dummy data for categories
    await db.query(`
        INSERT INTO categories(category_name)
        VALUES ('cat1'),
               ('cat2')`);

    //Create dummy data for items
    await db.query(`
        INSERT INTO items(item_name, item_desc, item_price, category)
        VALUES ('item1', 'item item item', '18.95', 'cat1'),
               ('item2', 'item item item', '18.95', 'cat2')`)
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