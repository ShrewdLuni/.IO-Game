window.addEventListener("keydown", (event) => {
  switch(event.code){
    case "KeyW":
      actions.move.isActive = true;
      break;
    case "Space":
      actions.shoot.isActive = true;
      break;
  }
});

window.addEventListener("keyup", (event) => {
  switch(event.code){
    case "KeyW":
      actions.move.isActive = false;
      break;
    case "Space":
      actions.shoot.isActive = false;
      break;
  }
});

window.addEventListener("mousemove", (event) => {
  if (!players[socket.id])
    return

  const player = players[socket.id];

  const offsetX = player.position.x - canvas.width / 2;
  const offsetY = player.position.y - canvas.height / 2;

  mousePosition.x = event.clientX + offsetX;
  mousePosition.y = event.clientY + offsetY;
  
  mouseMoved = true;

  if (mouseMoveTimeout) {
    clearTimeout(mouseMoveTimeout);
  }

  mouseMoveTimeout = setTimeout(() => {
    mouseMoved = false;
  }, 150);

  socket.emit("targetRotationUpdate", {x: event.clientX + offsetX, y: event.clientY + offsetY});
});
