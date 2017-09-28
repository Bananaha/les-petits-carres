const express = require('express');
const io = require('socket.io');
const router = require('express').Router();
const db = require('./server-modules/mongo-server');
const home = require('./server-modules/home');
const login = require('./server-modules/login');
let myDb;
const app = express();

const URL = 'mongodb://localhost:27017/littleSquares';
const PORT = 8888;
app
    .set('view engine', 'pug')
    .set('views', 'app/views')
    .use(express.static(__dirname + '/app/public'))
    .use('/home', home)
    .use('/', login);

db.connect(URL, (error, db) => {
    if (error) {
      console.log('impossible de se connecter')
    } else {
      mydb = db;
    }
  })


const server = app.listen(PORT, () => {
  console.log('connecté');
})

const websocketServer = io(server);


const players = [];
var squaresArray = [];
var fencesArray = [];

websocketServer.on('connection', (socket) => {
  socket.on('mouseClicked', (data) => {
    console.log(data)
  })

})


