"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

/** Related functions for users. */

class User {
    
    /** Authenticate user with username & password. 
     *  
     * Returns { username, firstName, lastName, email, phone, is_admin }
     * 
     * Throws UnauthorizedError if user not found or wrong password.
     */

    static async authenticate(username, password) {
        //try to find user first
        const result = await db.query(
            `SELECT username,
                    password,
                    first_name AS "firstName",
                    last_name AS "lastName",
                    email,
                    phone,
                    is_admin AS "isAdmin"
             FROM users
             WHERE username = $1`,
            [username]);

        const user = result.rows[0];

        if (user) {
            const isValid = await bcrypt.compare(password, user.password);
            if (isValid === true) {
                delete user.password;
                return user;
            }
        }
        throw new UnauthorizedError("Invalid username/password");
    }

    /** Register user with data.
     * 
     */


}

module.exports = User;