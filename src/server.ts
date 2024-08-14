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
import { getUserByUsername } from "./models/users";

const app = express();

app.use(cors({
  credentials: true,
}))

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

app.use("/api", router());

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

app.get("/profile/:username", async (req, res) => {
  const username = req.params.username;

  if(await getUserByUsername(username) == null){
    res.sendFile(path.join(__dirname, "../public/pages/404.html"));
    return;
  }

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
const mapCenter = { x: mapSize / 2, y: mapSize / 2 };

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
    movePlayer(socket.id, isActive);
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
    playerShoot(socket.id, isActive);
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
    activeBotsData[currentID] = {currentState: "Patrol",lastPositionUpdate:9999};

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
    if(shouldFlee(bID)){
      botData.currentState = "Flee";
    } else if (shouldChase(bID)){
      botData.currentState = "Chase"
    } else {
      botData.currentState = "Patrol";
    }
    //action
    switch (botData.currentState) {
      case "Patrol":
        patrol(bID)
        break;
      case "Chase":
        chase(bID)
        break;
      case "Flee":
        flee(bID)
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
        if(!players[pID] || !players[projectiles[id].playerID])
          return;
        players[pID].currentState.health -= players[projectiles[id].playerID].stats.damage;
        if(players[pID].currentState.health <= 0) {
          players[projectiles[id].playerID].currentState.score += 100;
          if(pID in activeBots) {
            players[pID].position = { x: mapSize * Math.random(), y: mapSize * Math.random() };
            players[pID].currentState.health = 1;
            players[pID].currentState.score = 0;
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
    rotation: 360 * Math.random(),
    targetRotation: 0,
    username: username,
    stats: {
      regeneration: 15,
      maxHealth: 100,
      bulletSpeed: 50,
      damage: 5,
      shootingSpeed: 50,
      rotationSpeed: 18,
      speed: 10,
    },
    currentState: {
      health: 100,
      lastRegeneration: 0,
      lastShot: 0,
      score: 0,
    }
  };
}

function movePlayer(id: string, isActive: boolean){
  if (isActive && players[id]) {
    players[id].position.x += Math.cos(players[id].rotation) * players[id].stats.speed;
    players[id].position.y += Math.sin(players[id].rotation) * players[id].stats.speed;

    if(players[id].position.x < -10){
      players[id].position.x = -10
    }
    if(players[id].position.x >= mapSize + 10){
      players[id].position.x = mapSize + 10
    }
    if(players[id].position.y < -10){
      players[id].position.y = -10
    }
    if(players[id].position.y >= mapSize + 10){
      players[id].position.y = mapSize + 10
    }
  }
}

function rotateBot(id: string){
  const bot = players[id];

  let difference = bot.targetRotation - bot.rotation;
  difference = (difference + Math.PI) % (2 * Math.PI) - Math.PI;

  if (difference > Math.PI) difference -= 2 * Math.PI;
  if (difference < -Math.PI) difference += 2 * Math.PI;

  if(Math.abs(difference) < Math.PI / bot.stats.rotationSpeed){
    bot.rotation = bot.targetRotation;
  } else{
    bot.rotation += Math.sign(difference) *  Math.PI / bot.stats.rotationSpeed;
  }
}

function playerShoot(id: string, isActive: boolean){
  const now = Date.now()

  if (isActive && players[id] && now - players[id].currentState.lastShot >= 1000 / players[id].stats.shootingSpeed){
    
    projectileID++;
    
    projectiles[projectileID] = {
      position: {
        x: players[id].position.x, 
        y: players[id].position.y
      },

      velocity: {
        x: Math.cos(players[id].rotation) * players[id].stats.bulletSpeed, 
        y: Math.sin(players[id].rotation) * players[id].stats.bulletSpeed
      },

      playerID: id,
      timestamp: now
    }

    players[id].currentState.lastShot = now;
  }
}

function shouldFlee(id: string) : boolean {

  return false;
}

function shouldChase(id: string) : boolean {
  const closestPlayerData = findClosestPlayer(id);
  if(!closestPlayerData)
    return false;
  if(closestPlayerData?.distance > 2000 || closestPlayerData?.distance < 200)
    return false;
  return true;
}

function patrol(id: string){
  const bot = players[id];

  if(!bot)
    return;

  const botData = activeBotsData[id];
  const now = Date.now();

  if (now - botData.lastPositionUpdate > 300000 * Math.random()) {
    const goToPosition = { x: mapSize * Math.random(), y: mapSize * Math.random() };
    const directionToPosition = Math.atan2(goToPosition.y - bot.position.y, goToPosition.x - bot.position.x) + ((Math.random() - 0.5) * 2 * 0.35);

    bot.targetRotation = directionToPosition;
    botData.lastPositionUpdate = now;
  }

  rotateBot(id)
  movePlayer(id, true);
}

function chase(id: string){
  const closestPlayerData = findClosestPlayer(id);
  if (closestPlayerData?.id) {
      const bot = players[id];
      const closestPlayer = players[closestPlayerData.id];
 
      const directionToPlayer = Math.atan2(closestPlayer.position.y - bot.position.y, closestPlayer.position.x - bot.position.x);

      bot.targetRotation = directionToPlayer + ((Math.random() - 0.5) * 2 * 0.35);
      rotateBot(id)
      movePlayer(id, true);
      playerShoot(id, true);
  } else{
    patrol(id);
  }
}

function flee(id: string){

}

function findClosestPlayer(id: string): { id: string | null; distance: number; } | null {
  const bot = players[id];
  if (!bot) return null;

  let closestPlayerID: string | null = null;
  let minDistance = Infinity;

  for (const pID in players) {
      if (pID === id) continue;

      const player = players[pID];
      const distance = Math.hypot(player.position.x - bot.position.x, player.position.y - bot.position.y);

      if (distance < minDistance) {
          minDistance = distance;
          closestPlayerID = pID;
      }
  }

  return {id: closestPlayerID, distance: minDistance};
}

//run server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
})