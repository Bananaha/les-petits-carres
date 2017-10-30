const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const userService = require('../services/userService');

router.use(bodyParser.json()).post('/', (req, res) => {
  userService
    .findAll()
    .then(dbUsers => {
      const users = [];
      dbUsers.forEach(({ mail, scores }) => {
        users.push({ mail, scores });
      });
      res.send(users);
    })
    .catch(err => {
      console.log('fail findAll Scores in scores route', err);
      res.status(500).send(Error);
    });
});

module.exports = router;
