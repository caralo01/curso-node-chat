const { io } = require("../server");
const { Users } = require("../classes/users");
const { createMessage } = require("../utils/utils");

const users = new Users();

io.on("connection", (client) => {
  client.on("joinChat", (data, callback) => {
    if (!data.name || !data.room) {
      return callback({
        error: true,
        message: "The name/room is required",
      });
    }

    client.join(data.room);

    users.addPerson(client.id, data.name, data.room);

    client.broadcast
      .to(data.room)
      .emit("listPerson", users.getPersonsForRoom(data.room));
    client.broadcast
      .to(data.room)
      .emit("createMessage", createMessage("Admin", `${data.name} joined`));

    callback(users.getPersonsForRoom(data.room));
  });

  client.on("createMessage", (data, callback) => {
    let person = users.getPerson(client.id);

    let message = createMessage(person.name, data.message);
    client.broadcast.to(person.room).emit("createMessage", message);

    callback(message);
  });

  client.on("disconnect", () => {
    let personDeleted = users.deletePerson(client.id);

    client.broadcast
      .to(personDeleted.room)
      .emit(
        "createMessage",
        createMessage("Admin", `${personDeleted.name} left`)
      );
    client.broadcast
      .to(personDeleted.room)
      .emit("listPerson", users.getPersonsForRoom(personDeleted.room));
  });

  // Mensajes privados
  client.on("privateMessage", (data) => {
    let person = users.getPerson(client.id);
    client.broadcast
      .to(data.to)
      .emit("privateMessage", createMessage(person.name, data.message));
  });
});
