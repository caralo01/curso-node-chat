var socket = io();

var params = new URLSearchParams(window.location.search);

if (!params.has("name") || !params.has("room")) {
  window.location = "index.html";
  throw new Error("El name y room son necesarios");
}

var user = {
  name: params.get("name"),
  room: params.get("room"),
};

socket.on("connect", function () {
  console.log("Connected Server");

  socket.emit("joinChat", user, function (resp) {
    // console.log('Usuarios conectados', resp);
    renderUsers(resp);
  });
});

// escuchar
socket.on("disconnect", function () {
  console.log("Lost connection");
});

// Enviar información
// socket.emit('createMessage', {
//     name: 'Fernando',
//     message: 'Hola Mundo'
// }, function(resp) {
//     console.log('respuesta server: ', resp);
// });

// Escuchar información
socket.on("createMessage", function (message) {
  // console.log('Servidor:', message);
  renderMessages(message, false);
  scrollBottom();
});

// Escuchar cambios de users
// cuando un user entra o sale del chat
socket.on("listPerson", function (person) {
  renderUsers(person);
});

// Mensajes privados
socket.on("privateMessage", function (message) {
  console.log("Private message:", message);
});
