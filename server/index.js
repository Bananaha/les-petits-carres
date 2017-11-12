const express = require('express');
const bodyParser = require('body-parser');

const config = require('../config')['development'];

const dbService = require('./services/dbService');
const login = require('./routes/login');
const scores = require('./routes/scores');
const templates = require('./routes/templates');

const app = express();

const HOST = config.database.host;
const PORT = config.database.port;
const dbName = config.database.db;
const URL = 'mongodb://' + HOST + ':27017/' + dbName;

app
  .set('view engine', 'pug')
  .set('views', __dirname + '/../app/views')
  .use(express.static(__dirname + '/../app/public'))
  .use('/templates', templates)
  .use('/api/login', login)
  .use('/api/scores', scores)
  .get('/', (req, res) => {
    res.render('index');
  });

const server = app.listen(config.server.port, () => {
  console.log('connecté');
});

const io = require('socket.io')(server);
const socketServer = require('./services/socket')(io);

dbService.connect(URL, (error, db) => {
  if (error) {
    console.log('impossible de se connecter à MongoDB');
  } else {
    return db;
  }
});
