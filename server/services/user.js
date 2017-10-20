const uuidv4 = require('uuid/v4');

const users = [];

const randomColor = () => {
  return (
    'rgb(' +
    Math.floor(Math.random() * 256) +
    ',' +
    Math.floor(Math.random() * 256) +
    ',' +
    Math.floor(Math.random() * 256) +
    ')'
  );
};

const create = ({ mail, password }) => {
  const newUser = {
    id: uuidv4(),
    mail,
    password,
    color: randomColor(),
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

const login = ({ mail, password }) => {
  let user = getByMail(mail);

  if (user && user.password !== password) {
    // throw Error('403');
  }

  if (!user) {
    user = create({ mail, password });
  }
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

module.exports = {
  login,
  users,
  findUser,
  findOpponent
};

// gérer le fait que l'utilisateur essaye de se connecter alors qu'il est déjà en ligne
