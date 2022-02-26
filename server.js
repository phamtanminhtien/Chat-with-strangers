const express = require("express");
const path = require("path");
const host = "0.0.0.0";
const app = express();
const httpServer = require("http").createServer(app);

require("dotenv").config();
const io = require("socket.io")(httpServer);
var list = [];
io.on("connection", function (socket) {
  socket.login = false;
  socket.on("submitName", function (data) {
    if (!socket.login) {
      if (data.name == "") {
        socket.emit("resultSubmitName", { r: 0 });
      } else {
        if (data.name in list) {
          socket.emit("resultSubmitName", { r: 1 });
        } else {
          socket.login = true;
          socket.emit("resultSubmitName", { r: 2 });
          socket.name = data.name;
          socket.pairing = "";
          list[data.name] = socket;
          for (var key in list) {
            el = list[key];
            if (socket.name != el.name && el.pairing == "") {
              list[key].pairing = socket.name;
              list[data.name].pairing = el.name;

              list[key].emit("user", data.name);
              list[data.name].emit("user", el.name);

              break;
            }
          }
        }
      }
    }
  });
  socket.on("sendMess", function (data) {
    if (socket.login && socket.pairing != "" && data.text != "") {
      list[socket.pairing].emit("sendMess", {
        name: list[socket.pairing].name,
        text: data.text,
        type: "sent",
      });
    }
  });
  socket.on("disconnect", function () {
    if (socket.login) {
      if (socket.pairing != "") {
        list[socket.pairing].emit("out", true);

        list[socket.pairing].pairing = "";
        list[socket.pairing].name = "";
        list[socket.pairing].login = false;

        delete list[socket.pairing];
        delete list[socket.name];

        socket.name = "";
        socket.pairing = "";
        socket.login = false;
      }
    }
  });
});

port = process.env.PORT || 5000;

httpServer.listen(port, host, function () {
  console.log("Run in port: " + port);
});

app.set("views", "views");
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", function (req, res) {
  res.render("index");
});
