const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const db = require('./mongo-server');

const createPlayer = (req) => {
    const players = db.get().collection('players');
    players.insert({
        pseudo: req.body.pseudo,
        isPlaying: true,
        lastConnexionDate: new Date(),
        score: []
    })
}

const findPlayer = (req) => {
    const players = db.get().collection('players');
    players.find({pseudo: req.body.pseudo}).toArray((error, data) => {
        if(error) {
            console.log('erreur');
        } else {
            return data
        }
    })
}

router
.use(bodyParser.urlencoded({
    extended: false
}))

.get('/', (req, res) => {
    res.render('login')
})

.post('/', (req, res) => {
    const player = findPlayer(req);
    
    if (!player) {
        console.log('le joueur n\'existe pas')
        createPlayer(req);
    } else {
        if (player[0].isPlaying === true) {
            console.log('pseudo déjà pris')
        } else {
            console.log('trouvé: ' + player[0].pseudo);
        }
    }

    res.redirect('/home');
})

module.exports = router;