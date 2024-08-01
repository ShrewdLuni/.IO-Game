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
    context.rotate(this.rotation);
    context.translate(-this.position.x, -this.position.y);
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

  shoot() {
    projectiles.push(new Projectile({
      position: {
        x: this.position.x + Math.cos(this.rotation) * 30,
        y: this.position.y + Math.sin(this.rotation) * 30
      },
      velocity: {
        x: Math.cos(this.rotation),
        y: Math.sin(this.rotation),
      }
    }));
  }
}
