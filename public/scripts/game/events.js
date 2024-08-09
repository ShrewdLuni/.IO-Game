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

  mousePosition.x = event.clientX + players[socket.id].position.x - canvas.width / 2;
  mousePosition.y = event.clientY + players[socket.id].position.y - canvas.height / 2;
  
  mouseMoved = true;
  
  if (mouseMoveTimeout) {
    clearTimeout(mouseMoveTimeout);
  }

  mouseMoveTimeout = setTimeout(() => {
    mouseMoved = false;
  }, 150);

  socket.emit("targetRotationUpdate", {x: mousePosition.x, y: mousePosition.y});
});
