const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const userService = require('../services/user');
const gameService = require('../services/game');

router.use(bodyParser.json()).post('/', (req, res) => {});

module.exports = router;
