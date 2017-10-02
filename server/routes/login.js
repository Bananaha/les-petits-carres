const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const userService = require('../services/user');
const gameService = require('../services/game');

router.use(bodyParser.json()).post('/', (req, res) => {
  const user = {
    mail: req.body.mail,
    password: req.body.password
  };

  const logInUser = userService.login(user);

  try {
    const userId = logInUser.id;
    res.send({ token: userId });
  } catch (err) {
    res.status(403).send('bad credentials');
  }
  const room = gameService.enter(logInUser);
  try {
    console.log('joueur créé');
  } catch (err) {
    console.log('erreur');
  }
});

module.exports = router;
