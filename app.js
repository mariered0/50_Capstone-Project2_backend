"use strict";

/** Express app for NoodleHut */

const express = require('express');

const { NotFoundError } = require('./expressError');

const { authenticateJWT } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const itemsRoutes = require('./routes/items');
const categoryRoutes = require('./routes/categories');

const morgan = require("morgan");
const cors = require('cors');
const app = express();

// Add Access Control Allow Origin headers
app.use(cors());

app.use(express.json());
app.use(morgan('dev'));
app.use(authenticateJWT);

app.use('/auth', authRoutes);
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