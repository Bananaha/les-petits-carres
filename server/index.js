const express = require('express');
const bodyParser = require('body-parser');

const dbService = require('./services/dbService');
const login = require('./routes/login');
const templates = require('./routes/templates');

const app = express();

let myDb;

const HOST = 'localhost';
const URL = 'mongodb://localhost:27017/littleSquares';
const PORT = 5000;

app
  .set('view engine', 'pug')
  .set('views', __dirname + '/../app/views')
  .use(express.static(__dirname + '/../app/public'))
  .use('/templates', templates)
  .use('/api/login', login)
  .get('/', (req, res) => {
    res.render('index');
  });

const server = app.listen(PORT, () => {
  console.log('connecté');
});

const io = require('socket.io')(server);
const socketServer = require('./services/socket')(io);

dbService.connect(URL, (error, db) => {
  if (error) {
    console.log('impossible de se connecter à MongoDB');
  } else {
    mydb = db;
  }
});
