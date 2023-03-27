"use strict";

/** Routes for menu items */

const jsonschema = require('jsonschema');
const express = require('express');

const Item = require('../models/item');
const Category = require('../models/category');
const { BadRequestError } = require('../expressError');

const itemNewSchema = require('../schemas/itemNew.json');
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



/** GET /:itemName =>  { item: [ { itemName, itemDesc, itemPrice, category }]}
 * 
 * Returns a list of an item with the itemName
 */

router.get('/:itemName', async function (req, res, next) {
    try{
        const item = await Item.findItem(req.params.itemName);
        return res.json({ item });
    }catch(err){
        return next(err);
    }
});

/** POST /:itemName =>  { item: [ { itemName, itemDesc, itemPrice, category }]}
 * 
 * Returns a list of an item with the itemName
 */

router.post('/', async function (req, res, next) {
    try{
        const validator = jsonschema.validate(req.body, itemNewSchema);
        if (!validator.valid){
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        // const res = await Category.findAll();
        // const categories = res.map(c => c.category_name);
        // if()
        // console.log('category:', categories);
        console.log('***************')
        console.log('req.body', req.body);
        const item = await Item.create(req.body.item);
        return res.status(201).json({ item });
    }catch(err){
        return next(err);
    }
});



module.exports = router;