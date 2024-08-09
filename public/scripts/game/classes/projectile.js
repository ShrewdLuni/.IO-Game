class Projectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 1;
  }

  render() {
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.radius, 1, Math.PI * 2, false);
    context.closePath();
    context.fillStyle = "white";
    context.fill();
  }
}
