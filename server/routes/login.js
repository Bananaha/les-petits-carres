const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const userService = require('../services/userService');

router.use(bodyParser.json()).post('/', (req, res) => {
  const user = {
    mail: req.body.mail,
    password: req.body.password,
    avatar: req.body.avatar
  };

  userService
    .login(user)
    .then(logedUser => {
      console.log('logedUser', logedUser);
      if (logedUser === 'wrong credentials') {
        res.status(403).send('wrong credentials');
        return;
      }
      if (logedUser === 'user already in game') {
        res.status(403).send('user already in game');
        return;
      }

      const userId = logedUser.id;
      res.send({ token: userId });
    })
    .catch(err => {
      console.log('fail loginUser in login route', err);
      res.status(403).send('bad credentials');
    });
});

module.exports = router;
