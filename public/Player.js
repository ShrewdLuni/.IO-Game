class Player {
  constructor({ position, rotation = 0 }) {
    this.position = position;
    this.velocity = {x: 0, y: 0};
    this.rotation = rotation;
    this.targetRotation = rotation;

    this.speed = 5;
    this.rotationSpeed = 0.10;
    this.scale = 2;
  }

  render() {
    context.save();
    context.translate(this.position.x, this.position.y);
    context.rotate(this.rotation);
    context.translate(-this.position.x, -this.position.y);
    context.beginPath();
    context.moveTo(this.position.x + 30 * this.scale, this.position.y);
    context.lineTo(this.position.x - 10 * this.scale, this.position.y - 10 * this.scale);
    context.lineTo(this.position.x - 10 * this.scale, this.position.y + 10 * this.scale);
    context.closePath();

    context.strokeStyle = "white";
    context.stroke();
    context.restore();
  }
}
