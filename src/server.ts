import express from "express";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const port = 3000;

const server = createServer(app);
const io = new Server(server, {});

app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

const players: {[id: string]: {x: number, y: number, color?: string,}} = {}

io.on("connection", (socket) => {
  console.log("user has connected")
  players[socket.id] = {
    x:100,
    y:100
  }

  socket.emit('updatePlayers', players)
})

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(__dirname);
});