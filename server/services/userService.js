const moment = require('moment');
const uuidv4 = require('uuid/v4');

const roomService = require('./roomService');
const dbService = require('./dbService');

// créer un joueur s'il n'existe pas dans la base de données
const create = props => {
  return dbService
    .create('users', {
      id: uuidv4(),
      mail: props.mail,
      password: props.password,
      avatar: props.avatar
    })
    .then(user => {
      return user.ops[0];
    });
};

// cherche dans la base de données un joueur à partir du mail renseigné dans le formulaire de log in
const findByMail = filter => {
  return dbService
    .getOne('users', {
      mail: filter.mail
    })
    .then(user => {
      return user;
    });
};
// met à jour la base de données avec les scores à la fin de la partie

// met à jour en base de données l'avatar choisi par l'utilisateur au moment du login
const updateAvatar = ({ mail, avatar }) => {
  try {
    dbService.update('users', { mail }, { $set: { avatar } });
  } catch (error) {
    return Promise.reject(error);
  }
};

const updateScores = players => {
  players.forEach(({ mail, score, date, status, timeLapse }) => {
    const scores = {
      date: date,
      score: score,
      playerStatus: status,
      timeLapse: timeLapse
    };
    try {
      dbService.update('users', { mail }, { $push: { scores } });
    } catch (error) {
      return Promise.reject(error);
    }
  });
};

const findAll = async () => {
  let usersScores;
  try {
    usersScores = await dbService.getAll('users', {
      scores: { $not: { $size: 0 } }
    });
    return usersScores;
  } catch (error) {
    return Promise.reject(error);
  }
};

const findById = async token => {
  let user;
  try {
    user = await dbService.getOne('users', { id: token });
    return user;
  } catch (error) {
    return Promise.reject(error);
  }
};

const login = async ({ mail, password, avatar }) => {
  let user;

  try {
    user = await findByMail({
      mail
    });
  } catch (error) {
    return Promise.reject(error);
  }

  if (user && user.password !== password) {
    const message = 'wrong credentials';
    return message;
  }

  if (user && roomService.findRoomByUser(user.mail, 'mail')) {
    const message = 'user already in game';
    return message;
  }

  updateAvatar({ mail, avatar });

  if (!user) {
    try {
      user = await create({
        mail,
        password,
        avatar
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }
  return user;
};

module.exports = {
  login,
  findById,
  updateScores,
  findAll
};
