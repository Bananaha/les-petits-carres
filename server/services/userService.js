const uuidv4 = require('uuid/v4');
const dbService = require('./dbService');

const usersCollection = dbService.get().collection('users');
const users = [];
const COLORS = ['#FC4349', '#6DBCDB'];

const create = ({ mail, password, avatar }, color) => {
  const newUser = {
    id: uuidv4(),
    mail,
    password,
    color: color,
    avatar: avatar,
    score: 0
  };
  users.push(newUser);
  return newUser;
};

const getByMail = mail => {
  return users.find(user => {
    return user.mail === mail;
  });
};

const findOpponent = mail => {
  return users.find(user => {
    return user.mail !== mail;
  });
};

const login = ({ mail, password, avatar }) => {
  let user = getByMail(mail);

  if (user && user.password !== password) {
    // throw Error('403');
  }

  if (!user) {
    const color = COLORS[users.length];
    user = create({ mail, password, avatar }, color);
    usersCollection.insertOne(
      {
        mail: user.mail,
        password: user.password,
        id: user.id,
        score: []
      },
      (err, result) => {
        if (err) {
          console.log("user's insertion failed", err);
          return;
        }
        console.log("user's insertion succed");
      }
    );
  }
  console.log('userService user.avater', user.avatar);
  return user;
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
  findUser,
  findOpponent
};

// gérer le fait que l'utilisateur essaye de se connecter alors qu'il est déjà en ligne
