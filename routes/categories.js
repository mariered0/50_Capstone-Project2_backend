"use strict";

/** Routes for menu categories */

const jsonschema = require('jsonschema');
const express = require('express');

const { BadRequestError } = require('../expressError');
const { ensureAdmin } = require('../middleware/auth');
const Category = require('../models/category');

const categoryNewSchema = require('../schemas/categoryNew.json');

const router = new express.Router();


/** GET /:category => { items: [{ id, itemName, itemDesc, itemPrice }, ...]}
 * 
 * Returns a list of items in the category.
 */

router.get('/:category', async function (req, res, next) {
    try{
        const items = await Category.get(req.params.category);
        return res.json({ items });
    }catch(err){
        return next(err);
    }
});

/** GET / => { categories: Cat1, Cat2, ... }
 * 
 * Returns a list of categories.
 */

router.get('/', async (req, res, next) => {
    try{
        const categories = await Category.findAll();
        return res.json({ categories });
    }catch(err){
        return next(err);
    }
})

/** POST / => { category_name: category }
 * 
 *  Returns a category created.
 */
router.post('/', ensureAdmin, async (req, res, next) => {
    try{
        const validator = jsonschema.validate(req.body, categoryNewSchema);
        if(!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const newCategory = await Category.create(req.body.categoryName);
        return res.status(201).json(newCategory);
    }catch(err){
        return next(err);
    }
})

/** PATCH /:categoryName => { category_name: category }
 *  
 * Returns category updated
 */

router.patch('/:category', ensureAdmin, async (req, res, next) => {
    try{
        
        const validator = jsonschema.validate(req.body, categoryNewSchema);
        if(!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const category = await Category.update(req.params.category, req.body.categoryName);
        return res.json(category);
    } catch(err){
        return next(err);
    }
});

/** DELETE /:category  => { deleted: category_name } */

router.delete('/:category', ensureAdmin, async (req, res, next) => {
    try{
        await Category.remove(req.params.category);
        return res.json({ deleted: req.params.category });
    }catch(err){
        console.log(err);
        return next(err);
    }
});




module.exports = router;