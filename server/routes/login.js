const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const userService = require('../services/userService');

router.use(bodyParser.json()).post('/', (req, res) => {
  console.log('loginSeervice_req.body', req.body);
  const user = {
    mail: req.body.mail,
    password: req.body.password,
    avatar: req.body.avatar
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
