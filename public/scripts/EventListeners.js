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
  const player = players[socket.id];
  if (!player)
    return

  const offsetX = player.position.x - canvas.width / 2;
  const offsetY = player.position.y - canvas.height / 2;

  mousePosition.x = event.clientX + offsetX;
  mousePosition.y = event.clientY + offsetY;
  socket.emit("targetRotationUpdate", {x: event.clientX + offsetX, y: event.clientY + offsetY});
});
