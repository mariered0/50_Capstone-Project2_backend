"use strict";

/** Routes for menu categories */

const jsonschema = require('jsonschema');
const express = require('express');

const Category = require('../models/category');

const router = express.Router();


/** GET /:category => { items: [{ itemName, itemDesc, itemPrice }, ...]}
 * 
 * Returns a list of items in the category.
 */

router.get('/:category', async function (req, res, next) {
    try{
        const items = await Category.findItems(req.params.category);
        return res.json({ items });
    }catch(err){
        return next(err);
    }
});

module.exports = router;