class Player {
  constructor({ position, rotation, username, stats, currentState}) {
    this.position = position;
    this.rotation = rotation;
    this.targetRotation = rotation;
    this.username = username;
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
    //Username
    context.save();
    context.font = "600 20px Arial";
    context.fillStyle = "white";
    context.textAlign = "center";
    let offset = (30 * this.scale);
    let facingTop = false;
    context.fillText(this.username, this.position.x, this.position.y + (facingTop ? -offset : offset));
    context.restore();
    //Health Indicator
    context.save();
    context.beginPath();
    context.arc(this.position.x , this.position.y , 5 * this.scale, 0, 2 * Math.PI);
    context.strokeStyle = "black";
    context.lineWidth = 4;
    context.stroke();



    const getHealthColor = () => {
      let healthPercentage = this.currentState.health / this.stats.maxHealth;
      if (healthPercentage > 0.5) {
        let ratio = (healthPercentage - 0.5) * 2;
        const r = Math.floor(255 * (1 - ratio));
        const g = 255;
        const b = 0;
        return `rgb(${r}, ${g}, ${b})`;
      } else {
        let ratio = healthPercentage * 2;
        const r = 255;
        const g = Math.floor(165 * ratio);
        const b = 0;
        return `rgb(${r}, ${g}, ${b})`;
      }
    };

    context.fillStyle = getHealthColor()
    context.fill();
    context.restore(); 
  }
}
