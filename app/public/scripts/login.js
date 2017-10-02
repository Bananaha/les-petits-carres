console.log(socket);

window.addEventListener('DOMContentLoaded', function() {
  // socket.on('forbiddenAccess', function(data) {
  //   loginMessage.innerHTML = data.message;
  // });
  console.log(socket);
  var loginMessage = document.getElementById('login-message');
  var formulaire = document.getElementById('formulaire');

  socket.on('loginMessage', function(message) {
    loginMessage.innerHTML = message.message;
  });

  formulaire.addEventListener('submit', function(event) {
    // event.preventDefault();
    // event.stopPropagation();

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    var radioButtons = document.getElementsByName('color-radio');

    var color;
    // récupère la valeur du bouton radio sélectionné
    for (var i = 0; i < radioButtons.length; i++) {
      if (radioButtons[i].checked) {
        color = radioButtons[i].value;
        break;
      }
    }

    socket.emit('newPlayer', {
      username,
      password,
      color,
      id: localStorage.getItem('token')
    });
    socket.on('TOKEN', function(token) {
      console.log('setting token');
      localStorage.setItem('token', token);
      window.location = 'http://' + HOST + ':' + PORT + '/home';
    });
  });
});
