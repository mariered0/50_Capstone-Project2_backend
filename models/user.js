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
const jwt = require("jsonwebtoken");

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
      [username]
    );

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

  static async register({
    username,
    password,
    firstName,
    lastName,
    email,
    phone,
    isAdmin,
  }) {
    const duplicateCheck = await db.query(
      `SELECT username
                     FROM users
                     WHERE username = $1`,
      [username]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(
        `This username is taken: ${username}. Choose different username.`
      );
    }

    if (phone.length !== 10) {
      throw new BadRequestError(
        `Phone number must have 10 digits, but entered '${phone}'`
      );
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

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
      [username, hashedPassword, firstName, lastName, email, phone, isAdmin]
    );

    const user = result.rows[0];
    return user;
  }

  /** Find all users.
   *
   *  Returns [{ username, firstName, lastName, email, phone, isAdmin }]
   *
   */

  static async findAll() {
    const result = await db.query(
      `SELECT username,
                first_name AS "firstName",
                last_name AS "lastName",
                email,
                phone,
                is_admin AS "isAdmin"
         FROM users
         ORDER BY username`
    );

    return result.rows;
  }

  /** Given a username, return data about the user.
   *
   * Returns { username, first_name, last_name, email, phone, is_admin, [favorites] }
   *
   * Throws NotFoundError is the user is not found.
   */

  static async get(username) {
    const result = await db.query(
      `SELECT username,
                    first_name AS "firstName",
                    last_name AS "lastName",
                    email,
                    phone,
                    is_admin AS "isAdmin"
             FROM users
             WHERE username = $1`,
      [username]
    );

    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    const userFavoriteRes = await db.query(
        `SELECT f.item_name
         FROM favorites AS f
         WHERE f.username = $1`, [username]);

    user.favorites = userFavoriteRes.rows.map(i => i.item_name);

    return user;
  }

  /** Update user data with data.
   *
   * This method can perform partial update.
   *
   * data can include:
   *  { firstName, lastName, password, email, phone, isAdmin }
   *
   * Returns { username, firstName, lastName, email, phone, isAdmin }
   *
   * Throws NotFoundError if no user is found.
   */

  static async update(username, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }

    const { setCols, values } = sqlForPartialUpdate(
      data, {
      firstName: "first_name",
      lastName: "last_name",
      isAdmin: "is_admin",
    });
    const usernameVarIdx = "$" + (values.length + 1);
    const querySql = `UPDATE users
                      SET ${setCols}
                      WHERE username = ${usernameVarIdx}
                      RETURNING username,
                                first_name AS "firstName",
                                last_name AS "lastName",
                                email,
                                phone,
                                is_admin AS "isAdmin"`;
                                
    const result = await db.query(querySql, [...values, username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    return user;
  }

  /** Delete the user from database;
   * 
   *  returns undefined */

  static async remove(username) {
    const result = await db.query(
        `DELETE
         FROM users
         WHERE username = $1
         RETURNING username`,
        [username]);
    const user = result.rows[0];

    if(!user) throw new NotFoundError(`No user: ${username}`);
  }

  /** Add the item to the user's favorite list in db.
   * 
   * Returns undefined
   */

  static async addToFavorite(username, itemName){
    const userCheck = await db.query(
      `SELECT username
       FROM users
       WHERE username = $1`, [username]);
    const user = userCheck.rows[0];
    if (!user) throw new NotFoundError(`No user: ${username}`);

    const itemCheck = await db.query(
      `SELECT item_name
       FROM items
       WHERE item_name = $1`, [itemName]);
    const item = itemCheck.rows[0];
    if (!item) throw new NotFoundError(`No item: ${itemName}`);

    await db.query(
      `INSERT INTO favorites (username, item_name)
       VALUES ($1, $2)`,
       [username, itemName]); 
  }

  /** Remove the item from the user's favorite list in db.
   * 
   * Returns undefined
   */

  static async removeFromFavorite(username, itemName){

    const user = await this.get(username);
    if (!user) throw new NotFoundError(`No user: ${username}`);

    const itemCheck = await db.query(
      `SELECT item_name
       FROM items
       WHERE item_name = $1`, [itemName]);
    const item = itemCheck.rows[0];
    if (!item) throw new NotFoundError(`No item: ${itemName}`);

    //Check if the item is included in the user's favorite list.
    if (user.favorites.includes(itemName)) {
      await db.query(
      `DELETE
       FROM favorites
       WHERE (username = $1 AND item_name = $2)`, [username, itemName])
    }else{
      throw new NotFoundError(`Not in favorite: ${itemName}`)
    }
  }

}

module.exports = User;
