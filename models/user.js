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
     * Return { username, firstName, lastName, email, phone, isAdmin }
     * 
     * Throws BadRequestError on duplicates.
     */

    static async register(
        { username, password, firstName, lastName, email, phone, isAdmin }) {
            console.log('username:', username, 'password:', password, 'first_name:', firstName, 'last_name:', lastName, 'email:', email, 'phone:', phone, 'isAdmin:', isAdmin);

            const duplicateCheck = await db.query(
                    `SELECT username
                     FROM users
                     WHERE username = $1`,
                    [username]);

            if (duplicateCheck.rows[0]) {
                throw new BadRequestError(`This username is taken: ${username}. Choose different username.`);
            }

            if (phone.length !== 10){
                throw new BadRequestError(`Phone number must have 10 digits, but entered '${phone}'`);
            }

            const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

            const hashedPhone = await bcrypt.hash(phone, BCRYPT_WORK_FACTOR);

            const result = await db.query(
                `INSERT INTO users
                 (username,
                 password,
                 first_name,
                 last_name,
                 email,
                 phone,
                 is_admin)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 RETURNING username, first_name AS "firstName", last_name AS "lastName", email, phone, is_admin AS "isAdmin"`,
                 [username, hashedPassword, firstName, lastName, email, hashedPhone, isAdmin]);

            const user = result.rows[0];
            return user;
    }

    /** Find all users.
     * 
     *  Returns [{ username, firstName, lastName, email, phone, isAdmin }]
     * 
     * 
     * 
     */



}

module.exports = User;