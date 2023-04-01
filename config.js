"use strict";

/** Shared config for application; can be required many places. */

// require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY || "noodlehut-secret-dev"
// const PORT = +process.env.PORT || 3000; Change after you set environmental variable.
const PORT = 3001;


function getDatabaseUri() {
    return (process.env.NODE_ENV === "test")
        ? "noodlehut_test"
        : process.env.DATABASE_URL || "noodlehut";
}


//Speed up bcrypt during tests
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1: 12;

module.exports = {
    SECRET_KEY,
    PORT,
    BCRYPT_WORK_FACTOR,
    getDatabaseUri
};