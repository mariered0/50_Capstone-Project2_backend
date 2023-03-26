const express = require('express');

const router = express.Router();

const USERS = [{ username: "Hummingbird123"}];
router.get('/', (req, res) => {
    res.json({users: USERS})
})

module.exports = router;