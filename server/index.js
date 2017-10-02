const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');

const router = require('express').Router();

const db = require('./mongo-server');
const login = require('./routes/login');
const game = require('./routes/game');
const templates = require('./routes/templates');

const app = express();

let myDb;

const HOST = 'localhost';
const URL = 'mongodb://localhost:27017/littleSquares';
const PORT = 8888;

app
  .set('view engine', 'pug')
  .set('views', __dirname + '/../app/views')
  .use(express.static(__dirname + '/../app/public'))
  .use('/templates', templates)
  .use('/api/login', login)
  .use('/api/game', game)
  .get('/', (req, res) => {
    res.render('index');
  });

const server = app.listen(PORT, () => {
  console.log('connecté');
});

const io = require('socket.io')(server);
const socketServer = require('./socket')(io);
db.connect(URL, (error, db) => {
  if (error) {
    console.log('impossible de se connecter');
  } else {
    mydb = db;
  }
});
