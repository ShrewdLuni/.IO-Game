import { PlayerData, ProjectileData, BotData } from "../types/PlayerTypes"
import { Server } from 'socket.io'


export class Game {
  players: { [id: string]: PlayerData } = {}
  projectiles: {[id: number]: ProjectileData } = {}
  activeBots: string[] = []
  activeBotsData: { [id: string]: BotData } = {}

  projectileID: number = 0;
  botID: number = 0;

  desiredPlayersCount = 2;
  mapSize = 10000;
  mapCenter = { x: this.mapSize / 2, y: this.mapSize / 2 };

  private io: Server;

  constructor(io: Server) {
    this.io = io;

    this.setupSocketListeners();
    this.startGameLoop();
  }

  private setupSocketListeners() {
    this.io.on("connection", (socket) => {
      console.log("user has connected")
    
      socket.on("disconnect", (reason) => {
        console.log(reason)
        delete this.players[socket.id]
      })
    
      socket.on("startGame", (username) => {
        this.createPlayer(socket.id, username);
      })
    
      socket.on("moveUpdate", (isActive : boolean) => {
        this.movePlayer(socket.id, isActive);
      })
    
      socket.on("rotationUpdate", (rotation) => {
        if(this.players[socket.id])
          this.players[socket.id].rotation = rotation;
      })
    
      socket.on("targetRotationUpdate", (targetPosition : {x: number,y: number}) => {
        if(this.players[socket.id])
          this.players[socket.id].targetRotation = Math.atan2(targetPosition.y - this.players[socket.id].position.y, targetPosition.x - this.players[socket.id].position.x)
      })
    
      socket.on("projectileUpdate", (isActive : boolean) => {
        this.playerShoot(socket.id, isActive);
      })
    
      socket.on("statsUpgrade", (upgradedStat) => {
        switch (upgradedStat) {
          case "Regeneration":
            this.players[socket.id].stats.regeneration += 1;
            break;
          case "Max Health":
            this.players[socket.id].stats.maxHealth += 5;
            break;
          case "Bullet Speed":
            this.players[socket.id].stats.bulletSpeed += 5;
            break;
          case "Damage":
            this.players[socket.id].stats.damage += 1;
            break;
          case "Shooting Speed":
            this.players[socket.id].stats.shootingSpeed += 1;
            break;
          case "Rotation Speed":
            this.players[socket.id].stats.rotationSpeed -= 2;
            break;
          case "Movement Speed":
            this.players[socket.id].stats.speed += 5;
            break;
          default:
            console.log("Invalid upgrade");
            break;
        }
      })
    })
  }

  private startGameLoop() {
    setInterval(() => {
      this.updateProjectiles();
      this.updateHealth();
      this.updateBots();

      // Emit updated data to all players
      this.io.emit("updateProjectiles", this.projectiles);
      this.io.emit("updatePlayers", this.players);
    }, 15);  // Every 15 milliseconds
  }


  
  private updateBots(){
    //spawn bots
    let playersCount = Object.keys(this.players).length
    while(playersCount <= this.desiredPlayersCount){
      playersCount++;
      this.botID++;
  
      let currentID = this.botID.toString();
      this.activeBots.push(currentID);
      this.activeBotsData[currentID] = {currentState: "Patrol",lastPositionUpdate:9999};
  
      this.createPlayer(this.botID.toString(), `Bot ${Math.floor(Math.random() * 90) + 10}`)
    }
    while(playersCount > this.desiredPlayersCount && this.activeBots){
      playersCount--;
      let currentID = this.activeBots.pop();
      if(currentID != undefined){
        delete this.activeBotsData[currentID];
        delete this.players[currentID];
      }
    }
    //bots loop
    for(const bID of this.activeBots){
      const bot = this.players[bID];
      const botData = this.activeBotsData[bID];
  
      //change state
      if(this.shouldFlee(bID)){
        botData.currentState = "Flee";
      } else if (this.shouldChase(bID)){
        botData.currentState = "Chase"
      } else {
        botData.currentState = "Patrol";
      }
      //action
      switch (botData.currentState) {
        case "Patrol":
          this.patrol(bID)
          break;
        case "Chase":
          this.chase(bID)
          break;
        case "Flee":
          this.flee(bID)
          break;
      }
    }
  }
  
  private updateProjectiles(){
    const now = Date.now();
    for (const id in this.projectiles){
      this.projectiles[id].position.x += this.projectiles[id].velocity.x;
      this.projectiles[id].position.y += this.projectiles[id].velocity.y;
  
      for (const pID in this.players) {
        const player = this.players[pID];
  
        const distance = Math.hypot(
          this.projectiles[id].position.x - player.position.x,
          this.projectiles[id].position.y - player.position.y
        )
  
        if (distance < 30 && this.projectiles[id].playerID !== pID){
          if(!this.players[pID] || !this.players[this.projectiles[id].playerID])
            return;
          this.players[pID].currentState.health -= this.players[this.projectiles[id].playerID].stats.damage;
          if(this.players[pID].currentState.health <= 0) {
            this.players[this.projectiles[id].playerID].currentState.score += 100;
            if(pID in this.activeBots) {
              this.players[pID].position = { x: this.mapSize * Math.random(), y: this.mapSize * Math.random() };
              this.players[pID].currentState.health = 1;
              this.players[pID].currentState.score = 0;
            } else{ 
              this.io.to(pID).emit("hitByProjectile");
              delete this.projectiles[id];
              delete this.players[pID]
            }
          } else {
            // console.log(players[pID].currentState.health)
          }
          break
        }
      }
          
      if(this.projectiles[id] && now - this.projectiles[id].timestamp > 1500){
        delete this.projectiles[id];
      }
    }
  }
  
  private updateHealth(){
    const now = Date.now();
    for (const pID in this.players) {
      const player = this.players[pID];
  
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
  
  private createPlayer(id: string, username: string){
    this.players[id] = {
      position: { x: this.mapSize * Math.random(), y: this.mapSize * Math.random() },
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
  
  private movePlayer(id: string, isActive: boolean){
    if (isActive && this.players[id]) {
      this.players[id].position.x += Math.cos(this.players[id].rotation) * this.players[id].stats.speed;
      this.players[id].position.y += Math.sin(this.players[id].rotation) * this.players[id].stats.speed;
  
      if(this.players[id].position.x < -10){
        this.players[id].position.x = -10
      }
      if(this.players[id].position.x >= this.mapSize + 10){
        this.players[id].position.x = this.mapSize + 10
      }
      if(this.players[id].position.y < -10){
        this.players[id].position.y = -10
      }
      if(this.players[id].position.y >= this.mapSize + 10){
        this.players[id].position.y = this.mapSize + 10
      }
    }
  }
  
  private rotateBot(id: string){
    const bot = this.players[id];
  
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
  
  private playerShoot(id: string, isActive: boolean){
    const now = Date.now()
  
    if (isActive && this.players[id] && now - this.players[id].currentState.lastShot >= 1000 / this.players[id].stats.shootingSpeed){
      
      this.projectileID++;
      
      this.projectiles[this.projectileID] = {
        position: {
          x: this.players[id].position.x, 
          y: this.players[id].position.y
        },
  
        velocity: {
          x: Math.cos(this.players[id].rotation) * this.players[id].stats.bulletSpeed, 
          y: Math.sin(this.players[id].rotation) * this.players[id].stats.bulletSpeed
        },
  
        playerID: id,
        timestamp: now
      }
  
      this.players[id].currentState.lastShot = now;
    }
  }
  
  private shouldFlee(id: string) : boolean {
  
    return false;
  }
  
  private shouldChase(id: string) : boolean {
    const closestPlayerData = this.findClosestPlayer(id);
    if(!closestPlayerData)
      return false;
    if(closestPlayerData?.distance > 2000 || closestPlayerData?.distance < 200)
      return false;
    return true;
  }
  
  private patrol(id: string){
    const bot = this.players[id];
  
    if(!bot)
      return;
  
    const botData = this.activeBotsData[id];
    const now = Date.now();
  
    if (now - botData.lastPositionUpdate > 300000 * Math.random()) {
      const goToPosition = { x: this.mapSize * Math.random(), y: this.mapSize * Math.random() };
      const directionToPosition = Math.atan2(goToPosition.y - bot.position.y, goToPosition.x - bot.position.x) + ((Math.random() - 0.5) * 2 * 0.35);
  
      bot.targetRotation = directionToPosition;
      botData.lastPositionUpdate = now;
    }
  
    this.rotateBot(id)
    this.movePlayer(id, true);
  }
  
  private chase(id: string){
    const closestPlayerData = this.findClosestPlayer(id);
    if (closestPlayerData?.id) {
        const bot = this.players[id];
        const closestPlayer = this.players[closestPlayerData.id];
   
        const directionToPlayer = Math.atan2(closestPlayer.position.y - bot.position.y, closestPlayer.position.x - bot.position.x);
  
        bot.targetRotation = directionToPlayer + ((Math.random() - 0.5) * 2 * 0.35);
        this.rotateBot(id)
        this.movePlayer(id, true);
        this.playerShoot(id, true);
    } else{
      this.patrol(id);
    }
  }
  
  private flee(id: string){
  
  }
  
  private findClosestPlayer(id: string): { id: string | null; distance: number; } | null {
    const bot = this.players[id];
    if (!bot) return null;
  
    let closestPlayerID: string | null = null;
    let minDistance = Infinity;
  
    for (const pID in this.players) {
        if (pID === id) continue;
  
        const player = this.players[pID];
        const distance = Math.hypot(player.position.x - bot.position.x, player.position.y - bot.position.y);
  
        if (distance < minDistance) {
            minDistance = distance;
            closestPlayerID = pID;
        }
    }
  
    return {id: closestPlayerID, distance: minDistance};
  }
}