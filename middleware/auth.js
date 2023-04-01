"use strict";

/** middle ware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require('../expressError');

/** Middleware: Authrnticate user
 * 
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (which includes the username and idmin field.)
 */

function authrnticateJWT(req, res, next){
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