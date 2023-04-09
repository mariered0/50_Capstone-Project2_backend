"use strict";

/** middle ware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require('../expressError');

/** Middleware: Authrnticate user
 * 
 * If a token was provided, verify it, and if valid, store the token payload
 * on res.locals (which includes the username and isAdmin field.)
 */

function authenticateJWT(req, res, next){
    try{
        const authHeader = req.headers && req.headers.authorization;
        if(authHeader){
            const token = authHeader.replace(/^[Bb]earer /, "").trim();
            res.locals.user = jwt.verify(token, SECRET_KEY);
        }
        return next();
    } catch (err) {
        return next();
    }
}

/** Middleware to use when users must be logged in. 
 *  
 * if not logged in, throw UnauthorizedError.
 */

function ensureLoggedIn (req, res, next) {
    try{
        if (!res.locals.user) throw new UnauthorizedError();
        return next();
    } catch (err) {
        return next (err);
    }
}

/** Middleware to use to make sure the user is admin.
 * 
 * if the user is not admin, throw UnauthorizedError.
 */

function ensureAdmin (req, res, next){
    try{
        console.log('user:', res.locals.user);
        if (!res.locals.user || !res.locals.user.isAdmin){
            throw new UnauthorizedError();
        }
        return next();
    }catch(err){
        return next(err);
    }
}

/** Middleware to use when the user must provide valid token that is for the user as route param or the user is admin. 
 * 
 * if not, throw UnauthorizedError.
 */

function ensureCorrectUserOrAdmin(req, res, next){
    try{
        const user = res.locals.user;
        if(!(user && (user.isAdmin || user.username === req.params.username))) {
            throw new UnauthorizedError();
        }
        return next ();
    } catch (err){
        return next (err);
    }
}

module.exports = {
    authenticateJWT,
    ensureLoggedIn,
    ensureAdmin,
    ensureCorrectUserOrAdmin
}