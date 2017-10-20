const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const userService = require('../services/user');

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
    console.log('fail loginUser in login route', err);
    res.status(403).send('bad credentials');
  }
});

module.exports = router;
