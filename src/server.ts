import express from "express";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const port = 3001;

const server = createServer(app);
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000});

app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/pages/index.html"));
});

const players: {[id: string]: {position: {x: number, y: number}, rotation: number, targetRotation: number, speed: number}} = {}

io.on("connection", (socket) => {
  console.log("user has connected")
  players[socket.id] = {position: {x: 200 * Math.random() , y: 200 * Math.random()}, rotation: 0, targetRotation: 0, speed: 5}

  io.emit("updatePlayers", players)

  socket.on("disconnect", (reason) => {
    console.log(reason)
    delete players[socket.id]
    io.emit("updatePlayers", players)
  })

  socket.on("moveUpdate", (isActive) => {
    if (isActive) {
      players[socket.id].position.x += Math.cos(players[socket.id].rotation) * players[socket.id].speed;
      players[socket.id].position.y += Math.sin(players[socket.id].rotation) * players[socket.id].speed;
    }
  })

  socket.on("rotationUpdate", (rotation) => {
    players[socket.id].rotation = rotation;
  })

  socket.on("targetRotationUpdate", (targetPosition : {x: number,y: number}) => {
    players[socket.id].targetRotation = Math.atan2(targetPosition.y - players[socket.id].position.y, targetPosition.x - players[socket.id].position.x)
  })
})

setInterval(() => {
  io.emit("updatePlayers", players)
}, 15)

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
})
