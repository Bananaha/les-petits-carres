const uuidv4 = require('uuid/v4');
const dbService = require('./dbService');

const users = [];
const COLORS = ['#FC4349', '#6DBCDB'];

const create = ({ mail, password, avatar }, collection) => {
  let newUser;
  const userProps = {
    mail: mail,
    password: password,
    score: []
  };
  collection.insertOne(userProps, (err, result) => {
    if (err) {
      console.log("user's insertion failed", err);
    } else {
      newUser = userProps;
      console.log("user's insertion succed", newUser);
      return newUser;
    }
  });
};

const login = ({ mail, password, avatar }) => {
  return dbService
    .getOne('users', { mail: mail })
    .then(user => console.log('coucou toi', user));
  return Promise.reject();
  const usersCollection = dbService.get().collection('users');

  let user;

  return usersCollection.findOne({ mail: mail }, (error, result) => {
    if (error) {
      console.log('userCollection.findOne', error);
    } else {
      if (result.length === 0) {
        user = create({ mail, password, avatar }, usersCollection);
      } else {
        user = result;
      }
    }
    if (user && user.password !== password) {
      console.log('wrong credentials');
      // throw Error('403');
    }

    const color = COLORS[users.length];
    user.id = uuidv4();
    user.color = color;
    user.avatar = avatar;
    console.log('user', user);
    users.push(user);
    return user;
  });
};

const findUser = token => {
  const matchingUser = users.find(user => {
    return user.id === token;
  });
  if (matchingUser) {
    return matchingUser;
  } else {
    // throw Error('401');
  }
};

const updateUsers = players => {
  players.forEach(player => {
    // usersCollection.update
  });
};

module.exports = {
  login,
  users,
  findUser
};

// gérer le fait que l'utilisateur essaye de se connecter alors qu'il est déjà en ligne
