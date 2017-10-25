// il ne peut y avoir plus d'une room disponible, les rooms sont créées et peuplées en fonction de la connexion de joueur.

const uuidv4 = require('uuid/v4');

const rooms = [];

function create() {
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
}

function findRoom(id) {
  return rooms.find(room => {
    return room.id === id;
  });
}

function findEmpty() {
  // permet de trouver un room vide
  return rooms.find(room => {
    return room.full === false;
  });
}

function join(user) {
  // rechercher une room incomplète
  let availableRoom = findEmpty();
  // si toute les rooms sont complètes ou qu'il n'en existe pas, création d'une room
  if (!availableRoom) {
    availableRoom = create(user);
  }
  console.log('roomService availableRoom', availableRoom.players);
  // attribution d'une nouvelle propriété au joueur contenant l'id de la room créée.
  user.roomId = availableRoom.id;

  //ajout du joueur à la room
  availableRoom.players.push(user);

  // si la room atteind son max de joueur après l'ajout du joueur, changer la propriété full pour indiquer qu'elle ne peut pas recevoir d'autres joueurs
  if (availableRoom.players.length === 2) {
    availableRoom.full = true;
  }
  // retourne l'ID de la room dans laquelle le joueur vient d'être ajouter
  return availableRoom;
}

function checkRoom(user) {
  // vérifier que le joueur a une propriété roomId, si c'est le cas, on retourne l'id de la room à laquelle il dépend
  if (!user || !user.roomId) {
    // sinon on le fait entrer dans une room
    return join(user);
  } else {
    return findRoom(user.roomId);
  }
}

module.exports = {
  checkRoom
};
