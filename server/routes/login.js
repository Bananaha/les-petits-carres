const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const userService = require('../services/userService');
const roomService = require('../services/roomService');

router
  .use(bodyParser.json())
  .post('/', (req, res) => {
    const user = {
      mail: req.body.mail,
      password: req.body.password,
      avatar: req.body.avatar
    };
    userService
      .login(user)
      .then(logedUser => {
        if (logedUser === 'wrong credentials') {
          res.status(403).send('wrong credentials');
          return;
        }
        if (logedUser === 'user already in game') {
          res.status(403).send('user already in game');
          return;
        }

        const userId = logedUser.id;
        res.status(200).send({ token: userId });
      })
      .catch(error => {
        res.status(403).send('FAILURE: token not set', error);
      });
  })
  .post('/checkToken', (req, res) => {
    const userAlreadyLoged = roomService.findRoomByUser(req.body.token, 'id');
    res.status(200).send(userAlreadyLoged);
  });

module.exports = router;
