"use strict";

/** Express app for NoodleHut */

const express = require('express');

const { NotFoundError } = require('./expressError');

const usersRoutes = require('./routes/users');
const itemsRoutes = require('./routes/items');
const categoryRoutes = require('./routes/categories');
const app = express();

app.use(express.json());

app.use('/users', usersRoutes);
app.use('/items', itemsRoutes);
app.use('/categories', categoryRoutes);


/** Handle 404 errors - This matches everything */
app.use(function (req, res, next) {
    return next(new NotFoundError());
});

/** Generic error handler; anything unhandled. */
app.use(function (err, req, res, next) {
    if (process.env.NODE_ENV !== "test") console.error(err.stack);
    const status = err.status || 500;
    const message = err.message;

    return res.status(status).json({
        error: { message, status}
    });
});

module.exports = app;