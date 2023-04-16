"use strict";

const db = require('../db.js');
const User = require('../models/user');
const Item = require('../models/item');
const Category = require('../models/category');
const { createToken } = require('../helpers/token');

async function commonBeforeAll() {
    await db.query("DELETE FROM users");
    await db.query("DELETE FROM items");
    await db.query("DELETE FROM categories");

    //create dummy catagory
    await Category.create("cat1");
    await Category.create("cat2");

    //create dummy items
    await Item.create(
        {
            itemName: "item1", 
            itemDesc: "item item item", 
            itemPrice: "18.95", 
            category: "cat1"
        }
    );
    await Item.create(
        {
            itemName: "item2", 
            itemDesc: "item item item", 
            itemPrice: "18.95", 
            category: "cat2"
        }
    );
    
    //create dummy users
    await User.register(
        {
            username: "test1",
            password: "123456",
            firstName: "test",
            lastName: "test",
            email: "test@gmail.com",
            phone: "0000000000",
            isAdmin: false
    });

    await User.register(
        {
            username: "test2",
            password: "123456",
            firstName: "test",
            lastName: "test",
            email: "test@gmail.com",
            phone: "0000000000",
            isAdmin: false
    });

    await User.register(
        {
            username: "test_admin",
            password: "123456",
            firstName: "test",
            lastName: "test",
            email: "test@gmail.com",
            phone: "0000000000",
            isAdmin: true
    });

    await User.addToFavorite("test1", "item1");
    await User.addToFavorite("test2", "item2");
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

const test1Token = createToken({ username: "test1", isAdmin: false });
const test2Token = createToken({ username: "test2", isAdmin: false });
const test_adminToken = createToken({ username: "test_admin", isAdmin: true });

module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    test1Token,
    test2Token,
    test_adminToken
};