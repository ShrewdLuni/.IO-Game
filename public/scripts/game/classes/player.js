class Player {
  constructor({ position, rotation, stats, currentState }) {
    this.position = position;
    this.rotation = rotation;
    this.targetRotation = rotation;
    this.stats = stats;
    this.currentState = currentState;
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
    context.lineWidth = 10;
    context.stroke();
    context.fillStyle = "black";
    context.fill();
    context.restore();

    context.save();
    context.font = "600 20px Arial";
    context.fillStyle = "white";
    context.textAlign = "center";
    let offset = (30 * this.scale);
    let facingTop = false;
    context.fillText("username", this.position.x, this.position.y + (facingTop ? -offset : offset));
    context.restore();

    context.save();
    context.beginPath();
    context.arc(this.position.x , this.position.y , 5 * this.scale, 0, 2 * Math.PI);
    context.strokeStyle = "white";
    context.lineWidth = 4;
    context.stroke();
    context.fillStyle = "green";
    context.fill();
    context.restore(); 
  }
}
