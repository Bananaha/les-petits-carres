const uuidv4 = require('uuid/v4');
const moment = require('moment');

const dbService = require('./dbService');

let users = [];
const COLORS = ['#FC4349', '#6DBCDB'];

const create = props => {
  return dbService
    .create('users', {
      mail: props.mail,
      password: props.password,
      scores: []
    })
    .then(user => {
      return user.ops[0];
    });
};

const removeInMemoryUser = mail => {
  users = users.filter(user => user.mail !== mail);
};

const userAlreadyIn = mail => {
  const matchingUser = users.find(user => {
    return user.mail === mail;
  });
  if (matchingUser) {
    return matchingUser;
  }
};

const findUser = token => {
  const matchingUser = users.find(user => {
    return user.id === token;
  });
  if (matchingUser) {
    return matchingUser;
  } else {
  }
};

const updateUsers = players => {
  players.forEach(({ mail, score, date, playerStatus }) => {
    try {
      updateScores(mail, {
        date: date,
        score: score,
        playerStatus: playerStatus
      });
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

const findByMail = filter => {
  return dbService.getOne('users', { mail: filter.mail }).then(user => {
    return user;
  });
};

const updateScores = (mail, scores) =>
  dbService.update('users', { mail }, { $push: { scores } });

const login = async ({ mail, password, avatar }) => {
  let user;
  try {
    user = await findByMail({ mail });
  } catch (error) {
    return Promise.reject(error);
  }
  if (user && user.password !== password) {
    const message = 'wrong credentials';
    return message;
  }
  if (user && userAlreadyIn(user.mail)) {
    const message = 'user already in game';
    return message;
  }

  if (!user) {
    try {
      user = await create({ mail, password });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  const color = COLORS[users.length];
  user.id = uuidv4();
  user.color = color;
  user.avatar = avatar;

  users.push(user);
  return user;
};

module.exports = {
  login,
  users,
  findUser,
  updateUsers,
  findAll,
  removeInMemoryUser
};

// gérer le fait que l'utilisateur essaye de se connecter alors qu'il est déjà en ligne
