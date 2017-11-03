const eventTypes = {
  CONNECTION: 'CONNECTION',
  PLAY: 'PLAY'
};

function attachDispatcher(myWSConnection) {
  // Initialise l'écoute des évenements sur chaque event pour la connection WS
  Object.values(eventTypes).forEach(eventType => {
    // on $event...
    myWSConnection.on(eventType, payload => {
      // ... appelle le dispatcher en lui passant l'event type et le payload
      dispatchSocketEvent(eventType, payload);
      // si besoin de passer la connection WS ou d'autres données, enrichir le dispatcher, exemple:
      // dispatchSocketEvent(eventType, { payload, ws: myWSConnection });
      // à refacto dans la function dispatcher en bas ;)
    });
  });
}

function dispatchSocketEvent(eventType, payload) {
  // Selon le type d'évenement, vient appeler la fonction qui va bien
  switch (eventType) {
    case eventTypes.CONNECTION:
      return myConnectionFunction();
      break;
    case eventTypes.PLAY:
      return myPlayFunction(payload);
      breack;
  }
}

module.exports = {
  attachDispatcher
};
