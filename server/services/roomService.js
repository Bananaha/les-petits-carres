// il ne peut y avoir plus d'une room disponible, les rooms sont créées et peuplées en fonction de la connexion de joueur.

const uuidv4 = require('uuid/v4');

const rooms = [];
const COLORS = ['#FC4349', '#6DBCDB'];

const create = () => {
  const newRoom = {
    //id de la room
    id: uuidv4(),
    // tableau contenant les joueurs de la room
    players: [],
    // statut de la room permettant de savoir si elle est pleine ou non
    full: false
  };

  // on ajoute la nouvelle room au tableau contenant les rooms existantes
  rooms.push(newRoom);
  return newRoom;
};

const findRoom = id => {
  return rooms.find(room => {
    return room.id === id;
  });
};

const findEmpty = () => {
  // permet de trouver une room vide
  return rooms.find(room => {
    return room.full === false;
  });
};

const join = user => {
  // rechercher une room incomplète
  let availableRoom = findEmpty();
  // si toute les rooms sont complètes ou qu'il n'en existe pas, création d'une room
  if (!availableRoom) {
    availableRoom = create(user);
  }
  // attribution de nouvelles propriétés au joueur contenant l'id de la room créée, la color attribuée pour la partie, l'avatar et le score.
  const color = COLORS[availableRoom.players.length];
  user.roomId = availableRoom.id;
  user.color = color;
  user.score = 49;

  //ajout du joueur à la room
  availableRoom.players.push(user);

  // si la room atteind son max de joueur après l'ajout du joueur, changer la propriété full pour indiquer qu'elle ne peut pas recevoir d'autres joueurs
  if (availableRoom.players.length === 2) {
    availableRoom.full = true;
  }
  // retourne l'ID de la room dans laquelle le joueur vient d'être ajouter
  return availableRoom;
};

// on vérifie si une room a déja le user dans ses players
// si non alors on en join / créé une
const checkRoom = user => findRoomByUser(user.id, 'id') || join(user);

// Cherche une room dont au moins un player a le même id / mail que celui recherché
const findRoomByUser = (userData, key) =>
  rooms.find(room => room.players.some(player => player[key] === userData));

module.exports = {
  checkRoom,
  findRoomByUser,
  findRoom
};
