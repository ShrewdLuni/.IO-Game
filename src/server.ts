import express from "express";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const port = 3000;

const server = createServer(app);
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000});

app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/pages/index.html"));
});

type Stats = {
  regeneration: number;
  maxHealth: number;
  bulletSpeed: number;
  damage: number;
  shootingSpeed: number;
  rotationSpeed: number;
  speed: number;
};


type CurrentState = {
  health: number;
  lastRegeneration: number;
};

type PlayerData = {
  position: { x: number; y: number };
  rotation: number;
  targetRotation: number;
  stats: Stats;
  currentState: CurrentState;
};

const players: { [id: string]: PlayerData } = {}
const projectiles: {[id: number]: {position: {x: number, y: number}, velocity: {x: number, y: number}, playerID: string, timestamp: number}} = {}

let projectileID: number = 0;

const mapSize = 10000;

io.on("connection", (socket) => {
  console.log("user has connected")
  players[socket.id] = {
    position: { x: 10 * Math.random(), y: 10 * Math.random() },
    rotation: 0,
    targetRotation: 0,
    stats: {
      regeneration: 15,
      maxHealth: 100,
      bulletSpeed: 20,
      damage: 5,
      shootingSpeed: 5,
      rotationSpeed: Math.PI / 18,
      speed: 10,
    },
    currentState: {
      health: 1,
      lastRegeneration: 0,
    }
  };

  socket.on("disconnect", (reason) => {
    console.log(reason)
    delete players[socket.id]
  })

  socket.on("moveUpdate", (isActive : boolean) => {
    if (isActive && players[socket.id]) {
      players[socket.id].position.x += Math.cos(players[socket.id].rotation) * players[socket.id].stats.speed;
      players[socket.id].position.y += Math.sin(players[socket.id].rotation) * players[socket.id].stats.speed;
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
          x: Math.cos(players[socket.id].rotation) * players[socket.id].stats.bulletSpeed, 
          y: Math.sin(players[socket.id].rotation) * players[socket.id].stats.bulletSpeed
        },

        playerID: socket.id,
        timestamp: Date.now()
      }
    }
  })


  socket.on("statsUpgrade", (info) => {
    console.log(info)
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

        players[pID].currentState.health -= players[projectiles[id].playerID].stats.damage;
        if(players[pID].currentState.health <= 0){
          io.to(pID).emit("hitByProjectile");
          delete projectiles[id];
          delete players[pID]
          console.log("died");
        } else {
          console.log(players[pID].currentState.health)
        }
        break
      }
    }
        
    if(projectiles[id] && now - projectiles[id].timestamp > 1500){
      delete projectiles[id];
    }
  }

  for (const pID in players) {
    const player = players[pID];

    if (!player.currentState.lastRegeneration) {
      player.currentState.lastRegeneration = now;
    }

    if (now - player.currentState.lastRegeneration >= 1000) {
      player.currentState.health = Math.min(
        player.stats.maxHealth,
        player.currentState.health + player.stats.regeneration
      );
      player.currentState.lastRegeneration = now;
    }
  }

  io.emit("updateProjectiles", projectiles)
  io.emit("updatePlayers", players)
}, 15)

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
})
