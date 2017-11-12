myApp.factory('socketService', function($rootScope) {
  var socket;

  function connect() {
    if (!socket) {
      socket = io.connect('http://localhost:5000');
    }
    return socket;
  }

  function on(eventName, callback) {
    socket.on(eventName, function() {
      var args = arguments;

      $rootScope.$apply(function() {
        callback.apply(socket, args);
      });
    });

    // Remove duplicate listeners
    socket.removeListener(eventName, callback);
  }

  function emit(eventName, data, callback) {
    socket.emit(eventName, data, function() {
      var args = arguments;

      $rootScope.$apply(function() {
        if (callback) {
          callback.apply(socket, args);
        }
      });
    });

    // Remove duplicate listeners
    socket.removeListener(eventName, callback);
  }

  return {
    connect: connect,
    on: on,
    emit: emit
  };
});
