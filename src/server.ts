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
const projectiles: {[id: number]: {position: {x: number, y: number}, velocity: {x: number, y: number}, playerID: string, timestamp: number}} = {}

let projectileID : number = 0;

const mapSize = 10000;

io.on("connection", (socket) => {
  console.log("user has connected")
  players[socket.id] = {position: {x: 10 * Math.random() , y: 10 * Math.random()}, rotation: 0, targetRotation: 0, speed: 5}

  socket.on("disconnect", (reason) => {
    console.log(reason)
    delete players[socket.id]
  })

  socket.on("moveUpdate", (isActive : boolean) => {
    if (isActive && players[socket.id]) {
      players[socket.id].position.x += Math.cos(players[socket.id].rotation) * players[socket.id].speed;
      players[socket.id].position.y += Math.sin(players[socket.id].rotation) * players[socket.id].speed;
      if(players[socket.id].position.x < -10){
        players[socket.id].position.x = -10
      }
      if(players[socket.id].position.x >= mapSize + 10){
        players[socket.id].position.x = mapSize + 10
      }
      if(players[socket.id].position.y < -10){
        players[socket.id].position.y = -10
      }
      if(players[socket.id].position.y >= mapSize + 10){
        players[socket.id].position.y = mapSize + 10
      }
    }
  })

  socket.on("rotationUpdate", (rotation) => {
    if(players[socket.id])
      players[socket.id].rotation = rotation;
  })

  socket.on("targetRotationUpdate", (targetPosition : {x: number,y: number}) => {
    if(players[socket.id])
      players[socket.id].targetRotation = Math.atan2(targetPosition.y - players[socket.id].position.y, targetPosition.x - players[socket.id].position.x)
  })

  socket.on("projectileUpdate", (isActive : boolean) => {
    if (isActive && players[socket.id]){
      projectileID++;
      projectiles[projectileID] = {
        position: {
          x: players[socket.id].position.x, 
          y: players[socket.id].position.y
        },

        velocity: {
          x: Math.cos(players[socket.id].rotation) * 10, 
          y: Math.sin(players[socket.id].rotation) * 10
        },

        playerID: socket.id,
        timestamp: Date.now()
      }
    }
  })

})

setInterval(() => {
  const now = Date.now();
  for (const id in projectiles){
    projectiles[id].position.x += projectiles[id].velocity.x;
    projectiles[id].position.y += projectiles[id].velocity.y;

    for (const pID in players) {
      const player = players[pID];

      const distance = Math.hypot(
        projectiles[id].position.x - player.position.x,
        projectiles[id].position.y - player.position.y
      )

      if (distance < 10 && projectiles[id].playerID !== pID){
        io.to(pID).emit("hitByProjectile");
        delete projectiles[id];
        delete players[pID]
        break
      }
    }
        
    if(projectiles[id] && now - projectiles[id].timestamp > 1500){
      delete projectiles[id];
    }
  }

  io.emit("updateProjectiles", projectiles)
  io.emit("updatePlayers", players)
}, 15)

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
})
