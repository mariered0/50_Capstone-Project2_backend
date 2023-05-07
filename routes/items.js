"use strict";

/** Routes for menu items */

const jsonschema = require('jsonschema');
const express = require('express');

const Item = require('../models/item');
const Category = require('../models/category');
const { BadRequestError } = require('../expressError');
const { ensureAdmin } = require('../middleware/auth');

const itemNewSchema = require('../schemas/itemNew.json');
const itemUpdateSchema = require('../schemas/itemUpdate.json');
const router = new express.Router();


/** GET / => { items: [ { itemName, itemDesc, itemPrice, category }, ... ]} 
 * 
 * Returns a list of all menu items.
 * 
**/

router.get('/', async function (req, res, next) {
    try {
        const items = await Item.findAll();
        return res.json({items});
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
        const item = await Item.get(req.params.itemName);
        return res.json({ item });
    }catch(err){
        return next(err);
    }
});

/** POST / =>  { item:  { itemName, itemDesc, itemPrice, category }}
 * 
 * Returns the item created => {{item: {id, itemName, itemDesc, itemPrice, categoryId}}
 * 
 * Authrization required: admin
 */

router.post('/', ensureAdmin, async function (req, res, next) {
    try{
        const validator = jsonschema.validate(req.body, itemNewSchema);
        if (!validator.valid){
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const item = await Item.create(req.body.item);
        return res.status(201).json({ item });
    }catch(err){
        return next(err);
    }
});


/** PATCH /:itemName { feild1, filed2, ... } => { item }
*
* Patches a menu item data.
*
* The fields can be: { itemName, itemDesc, itemPrice }
*
* Returns { item: { itemName, itemDesc, itemPrice, categoryId }}
*
* Authorization required: admin
*/


router.patch('/:itemName', ensureAdmin, async function (req, res, next) {
    try{
        const validator = jsonschema.validate(req.body, itemUpdateSchema);
        if (!validator.valid){
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const item = await Item.update(req.params.itemName, req.body);
        return res.json({ item })
    }catch(err){
        return next(err);
    }
})

/** DELETE /:itemName => { deleted: { items: {itemName, itemDesc, itemPrice, category }} }
 * 
 * Authorization: admin
 */

router.delete("/:itemName", ensureAdmin, async function (req, res, next) {
    try{
        const item = await Item.remove(req.params.itemName);
        return res.json({ deleted: { item }});
    }catch (err){
        return next (err);
    }
})


module.exports = router;