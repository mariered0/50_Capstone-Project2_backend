"use strict";

/** Routes for users. */

const jsonschema = require('jsonschema');

const express = require('express');
const { ensureCorrectUserOrAdmin, ensureAdmin } = require('../middleware/auth');
const { BadRequestError } = require('../expressError');
const User = require('../models/user');
const { createToken } = require('../helpers/token');
// const userNewSchema = require('../schemas/userNew.js');
const userUpdateSchema = require('../schemas/userUpdate.json');

const router = new express.Router();

/** GET / => { users: [{ username, firstName, lastName, email. phone, isAdmin }, ... ]}
 * 
 * Returns list of all users.
 * 
 * Authorization: admin
 */

router.get('/', async (req, res, next) => {
    try{
        const users = await User.findAll();
        return res.json({ users });
    }catch (err){
        return next(err);
    }
})

/** GET /:username => { user }
 * 
 * Returns { username, firstName, lastName, email. phone, favorites isAdmin }
 * 
 * Authorization: admin or the same user as the :username param
 */

router.get('/:username', ensureCorrectUserOrAdmin, async (req, res, next) => {
    try{
        const user = await User.get(req.params.username);
        return res.json({ user });
    } catch (err){
        return next(err);
    }
})

/** PATCH /:username => { user }
 *  
 * Returns { username, firstName, lastName, email, phone, isAdmin }
 * 
 * Authorization: admin or the same user as the :username param
 */
router.patch('/:username', ensureCorrectUserOrAdmin, async (req, res, next) => {
    try{
        const validator = jsonschema.validate(req.body, userUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const user = await User.update(req.params.username, req.body);
        return res.json({ user });
    }catch (err){
        return next(err);
    }
})

/** DELETE /:username => { deleted: username }
 *  
 *  Authorization required: admin or the same user as the username param
 */

router.delete("/:username", ensureCorrectUserOrAdmin, async (req, res, next) => {
    try{
        await User.remove(req.params.username);
        return res.json({ deleted: req.params.username});
    } catch(err){
        return next(err);
    }
});

/** POST /:username/items/:itemName => { favorite : itemName }
 * 
 * Returns {"favorite": itemName }
 * 
 * Authorizatio required: admin or the same user as the username param
 */

 router.post('/:username/items/:itemName', ensureCorrectUserOrAdmin, async (req, res, next) => {
    try{
        await User.addToFavorite(req.params.username, req.params.itemName);
        return res.json({ favorite: req.params.itemName });
    }catch(err){
        return next(err);
    }
 })

 /** DELETE /:username/items/:itemName => { removed: itemName }
  * 
  * Returns { removed: itemName }
  * 
  * Authorization required: admin or the same user as the username param
  */

 router.delete('/:username/items/:itemName', ensureCorrectUserOrAdmin, async (req, res, next) => {
    try{
        await User.removeFromFavorite(req.params.username, req.params.itemName);
        return res.json({ removed: req.params.itemName });
    }catch(err){
        return next(err);
    }
 })


module.exports = router;