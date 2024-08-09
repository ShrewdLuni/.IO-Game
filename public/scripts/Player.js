class Player {

  constructor({ position, rotation, stats }) {
    this.position = position;
    this.rotation = rotation;
    this.targetRotation = rotation;
    this.stats = stats
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

    // context.fillStyle = "white";
    // context.fill();

    context.strokeStyle = "white";
    context.lineWidth = 5;
    context.stroke();
    context.restore();
  }
}
