window.addEventListener("keydown", (event) => {
  switch(event.code){
    case "KeyW":
      actions.move.isActive = true;
      break;
  }
});

window.addEventListener("keyup", (event) => {
  switch(event.code){
    case "KeyW":
      actions.move.isActive = false;
      break;
  }
});

window.addEventListener("mousemove", (event) => {
  mousePosition.x = event.clientX;
  mousePosition.y = event.clientY;
  socket.emit("targetRotationUpdate", {x: event.clientX, y: event.clientY});
});
