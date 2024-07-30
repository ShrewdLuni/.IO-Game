const canvas = document.querySelector("canvas");
const context = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


class Player {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.rotation = 0;
    this.health = 100;
    this.turbo = 5;

    this.speed = 4;
    this.rotationSpeed = 0.10;
    this.maxHealth = 100;
    this.damage = 1;
    this.turboLimit = 5;
  }

  render() {
    context.save();
    context.translate(this.position.x, this.position.y);
    context.rotate(this.rotation)
    context.translate(-this.position.x, -this.position.y)
    context.beginPath();
    context.moveTo(this.position.x + 30, this.position.y);
    context.lineTo(this.position.x - 10, this.position.y - 10);
    context.lineTo(this.position.x - 10, this.position.y + 10);
    context.closePath();
    
    context.strokeStyle = "white";
    context.stroke();
    context.restore();
  }

  move() {
    this.render();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  rotateTo(targetRotation) {
    let difference = targetRotation - this.rotation;
    difference = (difference + Math.PI) % (2 * Math.PI) - Math.PI;
    this.rotation += difference * this.rotationSpeed;
  }

  shoot(){
    projectiles.push(new Projectile({
      position: {
        x: this.position.x + Math.cos(this.rotation) * 30,
        y: this.position.y + Math.sin(this.rotation) * 30
      },
      velocity: {
        x: Math.cos(this.rotation),
        y: Math.sin(this.rotation),
      }
    }))
  }
}

class Projectile {
  constructor({position, velocity}) {
    this.position = position
    this.velocity = velocity
    this.radius = 5;
  }

  render(){
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
    context.closePath();
    context.fillStyle = "white";
    context.fill();
  }

  move(){
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.render()
  }
}


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


window.addEventListener("keydown", (event) => {
  switch(event.code){
    case "KeyW":
      actions.move.isActive = true;
      break
    case "Space":
      actions.shoot.isActive = true;
      break;
  }
})

window.addEventListener("keyup", (event) => {
  switch(event.code){
    case "KeyW":
      actions.move.isActive = false;
      break
    case "Space":
      // actions.shoot.isActive = false;
      player.shoot();
      break;
  }
})

window.addEventListener("mousemove", (event) => {
  mousePosition.x = event.clientX;
  mousePosition.y = event.clientY;
})

window.addEventListener("mousedown", (event) => {
  actions.move.isActive = true;
})
window.addEventListener("mouseup", (event) => {
  actions.move.isActive = false;
})


update()//start game