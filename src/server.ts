import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression"; 
import cors from "cors";
import router from "./router";
import path from "path";
import fs from "fs";
import { createServer } from "http";
import { Server } from "socket.io";
import { BotData, PlayerData, ProjectileData } from "./types/PlayerTypes";

const app = express();

app.use(cors({
  credentials: true,
}))

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

app.use("/", router());

const port = 3000;

const server = createServer(app);
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000});

app.use(express.static(path.join(__dirname, "../public")));

//routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/pages/index.html"));
});

app.get("/leaderboard", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/pages/leaderboard.html"));
});

app.get("/profile/:username", (req, res) => {
  const username = req.params.username;
  const filePath = path.join(__dirname, "../public/pages", "profile.html");
  let template = fs.readFileSync(filePath, "utf-8");
  res.send(template.replace(/{{name}}/g, username));
});

//game logic
const players: { [id: string]: PlayerData } = {}
const projectiles: {[id: number]: ProjectileData } = {}
const activeBots: string[] = []
const activeBotsData: { [id: string]: BotData } = {}

let projectileID: number = 0;
let botID: number = 0;

const desiredPlayersCount = 5;
const mapSize = 10000;

io.on("connection", (socket) => {
  console.log("user has connected")

  socket.on("disconnect", (reason) => {
    console.log(reason)
    delete players[socket.id]
  })

  socket.on("startGame", (username) => {
    createPlayer(socket.id, username);
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
    const now = Date.now()

    if (isActive && players[socket.id] && now - players[socket.id].currentState.lastShot >= 1000 / players[socket.id].stats.shootingSpeed){
      
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
        timestamp: now
      }

      players[socket.id].currentState.lastShot = now;
    }
  })

  socket.on("statsUpgrade", (upgradedStat) => {
    switch (upgradedStat) {
      case "Regeneration":
        players[socket.id].stats.regeneration += 1;
        break;
      case "Max Health":
        players[socket.id].stats.maxHealth += 5;
        break;
      case "Bullet Speed":
        players[socket.id].stats.bulletSpeed += 5;
        break;
      case "Damage":
        players[socket.id].stats.damage += 1;
        break;
      case "Shooting Speed":
        players[socket.id].stats.shootingSpeed += 1;
        break;
      case "Rotation Speed":
        players[socket.id].stats.rotationSpeed -= 2;
        break;
      case "Movement Speed":
        players[socket.id].stats.speed += 5;
        break;
      default:
        console.log("Invalid upgrade");
        break;
    }
  })
})

setInterval(() => {
  updateProjectiles();
  updateHealth();
  updateBots();

  io.emit("updateProjectiles", projectiles)
  io.emit("updatePlayers", players)
}, 15)

function updateBots(){
  //spawn bots
  let playersCount = Object.keys(players).length
  while(playersCount <= desiredPlayersCount){
    playersCount++;
    botID++;

    let currentID = botID.toString();
    activeBots.push(currentID);
    activeBotsData[currentID] = {currentState: "Patrol"};

    createPlayer(botID.toString(), `Bot ${Math.floor(Math.random() * 90) + 10}`)
  }
  while(playersCount > desiredPlayersCount && activeBots){
    playersCount--;
    let currentID = activeBots.pop();
    if(currentID != undefined){
      delete activeBotsData[currentID];
      delete players[currentID];
    }
  }
  //bots loop
  for(const bID of activeBots){
    const bot = players[bID];
    const botData = activeBotsData[bID];

    //change state
    if(shouldFlee()){
      botData.currentState = "Flee";
    } else if (shouldChase()){
      botData.currentState = "Chase"
    } else {
      botData.currentState = "Patrol";
    }
    //action
    switch (botData.currentState) {
      case "Patrol":
        patrol()
        break;
      case "Chase":
        chase()
        break;
      case "Flee":
        flee()
        break;
    }
  }
}

function updateProjectiles(){
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

      if (distance < 30 && projectiles[id].playerID !== pID){

        players[pID].currentState.health -= players[projectiles[id].playerID].stats.damage;
        if(players[pID].currentState.health <= 0) {
          players[projectiles[id].playerID].currentState.score += 100;
          if(pID in activeBots) {
            players[pID].position = { x: mapSize * Math.random(), y: mapSize * Math.random() };
            players[pID].currentState.health = 1;
            players[pID].currentState.score = 0;
            console.log(players[pID].position)
          } else{ 
            io.to(pID).emit("hitByProjectile");
            delete projectiles[id];
            delete players[pID]
          }
        } else {
          // console.log(players[pID].currentState.health)
        }
        break
      }
    }
        
    if(projectiles[id] && now - projectiles[id].timestamp > 1500){
      delete projectiles[id];
    }
  }
}

function updateHealth(){
  const now = Date.now();
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
}

function createPlayer(id: string, username: string){
  players[id] = {
    position: { x: mapSize * Math.random(), y: mapSize * Math.random() },
    rotation: 0,
    targetRotation: 0,
    username: username,
    stats: {
      regeneration: 15,
      maxHealth: 100,
      bulletSpeed: 20,
      damage: 5,
      shootingSpeed: 10,
      rotationSpeed: 72,
      speed: 10,
    },
    currentState: {
      health: 1,
      lastRegeneration: 0,
      lastShot: 0,
      score: 0,
    }
  };
}

function shouldFlee() : boolean {
  return false;
}

function shouldChase() : boolean {
 return false;
}

function patrol(){

}

function chase(){

}

function flee(){

}

//run server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
})