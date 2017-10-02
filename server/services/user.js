const uuidv4 = require('uuid/v4');

const users = [];

function create({ mail, password }) {
  const newUser = {
    id: uuidv4(),
    mail,
    password
  };
  users.push(newUser);
  return newUser;
}

function getByMail(mail) {
  return users.find(user => {
    return user.mail === mail;
  });
}

function login({ mail, password }) {
  let user = getByMail(mail);

  if (user && user.password !== password) {
    // throw Error('403');
  }

  if (!user) {
    user = create({ mail, password });
  }
  return user;
}

module.exports = {
  login
};

// gérer le fait que l'utilisateur essaye de se connecter alors qu'il est déjà en ligne