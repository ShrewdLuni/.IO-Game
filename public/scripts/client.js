const canvas = document.querySelector("canvas");
const context = canvas.getContext('2d');

const socket = io();

const dot = document.getElementById('dot');
const cordinatesTextBox = document.getElementById('cordinates');

const mapWidth = 10000;
const mapHeight = 10000;

const actions = {
  move: {
    isActive: false
  },
  shoot: {
    isActive: false
  }
}

let isAlive = true;

let mouseMoved = false;
let mouseMoveTimeout;

let mousePosition = {
  x: 0,
  y: 0,
};

const players = {};
const projectiles = {}

socket.on("updatePlayers", (serverData) => {
  for(const id in serverData){
    const serverPlayer = serverData[id]
    if(!players[id]){
      players[id] = new Player({position: {x: serverPlayer.position.x, y: serverPlayer.position.y}, rotation: serverPlayer.rotation})
    }
    else{
      players[id].rotation = serverPlayer.rotation;
      players[id].targetRotation = serverPlayer.targetRotation;

      gsap.to(players[id].position, {
        duration: 0.015,
        x: serverPlayer.position.x,
        y: serverPlayer.position.y,
        ease: "linear"
      });
    }
  }
  for(const id in players){
    if(!serverData[id]){
      delete players[id]
    }
  }
})

socket.on("updateProjectiles", (serverData) => {
  for(const id in serverData){
    const projectile = serverData[id]
    if(!projectiles[id]){
      projectiles[id] = new Projectile({
        position: projectile.position,
        velocity: projectile.velocity
      })
    }
    else{
      projectiles[id].position.x += projectile.velocity.x;
      projectiles[id].position.y += projectile.velocity.y;
    }
  }
  for(const id in projectiles){
    if(!serverData[id]){
      delete projectiles[id]
    }
  }
})

socket.on("hitByProjectile", () => {
  isAlive = false;
  stopGame();
  console.log("Died.");
});

setInterval(() => {
  if(!isAlive || !players[socket.id])
    return;

  let player = players[socket.id];

  if (actions.move.isActive) {
    player.position.x += Math.cos(player.rotation) * player.speed;
    player.position.y += Math.sin(player.rotation) * player.speed;
  }

  if(mouseMoved){
    player.targetRotation = Math.atan2(mousePosition.y - player.position.y, mousePosition.x - player.position.x);
  }
  let difference = player.targetRotation - player.rotation;
  difference = (difference + Math.PI) % (2 * Math.PI) - Math.PI;
  if (difference > Math.PI) difference -= 2 * Math.PI;
  if (difference < -Math.PI) difference += 2 * Math.PI;
  if(Math.abs(difference) < Math.PI / 6){
    player.rotation = player.targetRotation;
  } else{
    player.rotation += Math.sign(difference) * Math.PI / 6;
  }

  socket.emit("moveUpdate", actions.move.isActive);
  socket.emit("projectileUpdate", actions.shoot.isActive);
  socket.emit("rotationUpdate", player.rotation);
}, 15);

function update() {
  window.requestAnimationFrame(update);

  context.fillStyle = "black";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  context.fillRect(0, 0, canvas.width, canvas.height);

  if(players[socket.id]){
    const offsetX =  players[socket.id].position.x - canvas.width / 2;
    const offsetY =  players[socket.id].position.y - canvas.height / 2;

    context.save();
    context.translate(-offsetX, -offsetY);
    cordinatesTextBox.textContent = `x: ${Math.round(players[socket.id].position.x)} y:${Math.round(players[socket.id].position.y)}`
    dot.style.left = `${players[socket.id].position.x / 40}px`;
    dot.style.top = `${players[socket.id].position.y / 40}px`;
  }

  for (const id in players) {
    players[id].render();
  }

  for(const id in projectiles){
    projectiles[id].render();
  }

  context.restore();
}

update();