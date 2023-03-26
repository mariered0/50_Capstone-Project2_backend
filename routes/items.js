"use strict";

/** Routes for menu items */

const jsonschema = require('jsonschema');
const express = require('express');

const Item = require('../models/item');

const router = express.Router();

/** GET / => { items: [ { itemName, itemDesc, itemPrice, category }, ... ]} 
 * 
 * Returns a list of all menu items.
 * 
**/

router.get('/', async function (req, res, next) {
    try {
        const items = await Item.findAll();
        return res.json({ items });
    } catch (err){
        return next(err);
    }
});

module.exports = router;