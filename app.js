const express = require("express");
const app = express();
const http = require("http");
const socketio = require("socket.io");
const server = http.createServer(app);
const path = require("path");

const io = socketio(server);

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", function (socket) {
  socket.on("Send-location", function (data) {
    console.log("location id: ", socket.id);
    io.emit("receive-location", {
      id: socket.id,
      ...data,
    });
  });
  console.log("connected: ", socket.id);
  socket.on("disconnect", function (data) {
    console.log("disconnected id: ", socket.id);
    io.emit("disconnected-location", {
      id: socket.id,
      ...data,
    });
  });
});

app.get("/", function (req, res) {
  res.render("index");
});

server.listen(3100, () => {
  console.log("Server is running on http://localhost:3100");
});
