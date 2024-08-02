const canvas = document.querySelector("canvas");
const context = canvas.getContext('2d');

const socket = io();

const devicePixelRatio = window.devicePixelRatio || 1;

canvas.width = window.innerWidth * devicePixelRatio;
canvas.height = window.innerHeight * devicePixelRatio;

const player = new Player({
  position: {x: canvas.width / 2, y: canvas.height / 2},
});

const actions = {
  move: {
    isActive : false
  },
  shoot: {
    isActive : false
  }
}

let mousePosition = {
  x: player.position.x,
  y: player.position.y,
};


const players = {};

socket.on('updatePlayers', (serverData) => {
  for(const id in serverData){
    const serverPlayer = serverData[id]
    if(!players[id]){
      players[id] = new Player({position: {x: serverPlayer.position.x, y: serverPlayer.position.y}, rotation: serverPlayer.rotation})
    }
    else{
      players[id].position.x = serverPlayer.position.x;
      players[id].position.y = serverPlayer.position.y;
      players[id].rotation = serverPlayer.rotation;

      let targetRotation = Math.atan2(mousePosition.y - players[id].position.y, mousePosition.x - players[id].position.x)
      let difference = targetRotation - players[id].rotation;
      difference = (difference + Math.PI) % (2 * Math.PI) - Math.PI;
      players[id].rotation += difference * 0.10;
    }
  }
  for(const id in players){
    if(!serverData[id]){
      delete players[id]
    }
  }
})

//game loop
function update() {
  window.requestAnimationFrame(update);

  context.fillStyle = "black";
  context.fillRect(0, 0, canvas.width, canvas.height);


  for (const id in players) {
    players[id].render();
  }
}

update()//start game

// const projectiles = [];

// for(let i = projectiles.length - 1; i >= 0; i--){
//   const projectile = projectiles[i]
//   projectile.move();

//   if(projectile.position.x + projectile.radius < 0 
//     || projectile.position.x - projectile.radius > canvas.width
//     || projectile.position.y + projectile.radius < 0
//     || projectile.position.y - projectile.radius > canvas.height){
//           projectiles.splice(i, 1);
//   }
// }