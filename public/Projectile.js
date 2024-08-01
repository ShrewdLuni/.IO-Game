class Projectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 5;
  }

  render() {
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
    context.closePath();
    context.fillStyle = "white";
    context.fill();
  }

  move() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.render();
  }
}
