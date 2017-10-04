const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const userService = require('../services/user');
const gameService = require('../services/game');

router.use(bodyParser.json()).post('/', (req, res) => {
  const receivedToken = req.body.token;

  const user = userService.findUser(receivedToken);
  const room = gameService.checkRoom(user);
  let message;
  if (room.players.length < 2) {
    message = "Patientez jusqu'à l'arrivée d'un joueur";
  } else {
    message = 'La partie va commencer';
  }
  try {
    res.send({
      userMail: user.mail,
      message: message
    });
  } catch (err) {
    res
      .status(401)
      .send('Une authentification est nécessaire pour accéder à la ressource.');
  }
});

module.exports = router;
