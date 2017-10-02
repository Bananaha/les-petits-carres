const uuidv4 = require('uuid/v4');

const rooms = [];

function create() {
  const newRoom = {
    id: uuidv4(),
    players: [],
    full: false
  };

  rooms.push(newRoom);
  return newRoom;
}

function findEmpty() {
  return rooms.find(room => {
    return room.full === false;
  });
}

function enter(user) {
  let availableRoom = findEmpty();

  if (!availableRoom) {
    availableRoom = create(user);
  }

  availableRoom.players.push(user);

  if (availableRoom.players.length === 2) {
    availableRoom.full = true;
  }
  console.log(availableRoom);
  return availableRoom;
}

module.exports = {
  enter
};
