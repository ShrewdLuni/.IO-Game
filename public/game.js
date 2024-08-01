const canvas = document.querySelector("canvas");
const context = canvas.getContext('2d');

const socket = io();

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const player = new Player({
  position: {x: canvas.width / 2, y: canvas.height / 2},
  velocity: {x: 0, y: 0},
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

const projectiles = [];


socket.on('updatePlayers', (players) => {
  console.log(players)
})

//game loop
function update() {
  window.requestAnimationFrame(update);

  context.fillStyle = "black";
  context.fillRect(0, 0, canvas.width, canvas.height);

  player.move();

  player.rotateTo(Math.atan2(mousePosition.y - player.position.y, mousePosition.x - player.position.x));

  for(let i = projectiles.length - 1; i >= 0; i--){
    const projectile = projectiles[i]
    projectile.move();

    if(projectile.position.x + projectile.radius < 0 
      || projectile.position.x - projectile.radius > canvas.width
      || projectile.position.y + projectile.radius < 0
      || projectile.position.y - projectile.radius > canvas.height){
            projectiles.splice(i, 1);
    }
  }


  if(actions.move.isActive) {
    player.velocity.x = Math.cos(player.rotation) * player.speed;
    player.velocity.y = Math.sin(player.rotation) * player.speed;
  } else{
    player.velocity.x *= .99;
    player.velocity.y *= .99;
  }
}

update()//start game