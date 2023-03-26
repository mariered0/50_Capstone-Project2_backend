"use strict";

/** Shared config for application; can be required many places. */

// require("dotenv").config();

// const PORT = +process.env.PORT || 3000; Change after you set environmental variable.
const PORT = 3001;


function getDatabaseUri() {
    return (process.env.NODE_ENV === "test")
        ? "noodlehut_test"
        : process.env.DATABASE_URL || "noodlehut";
}

module.exports = {
    PORT,
    getDatabaseUri
};