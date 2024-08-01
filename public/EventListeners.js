window.addEventListener("keydown", (event) => {
  switch(event.code){
    case "KeyW":
      socket.emit("moveUpdate", true)
      break
    case "Space":
      actions.shoot.isActive = true;
      break;
  }
})

window.addEventListener("keyup", (event) => {
  switch(event.code){
    case "KeyW":
      socket.emit("moveUpdate", false)
      break
    case "Space":
      // actions.shoot.isActive = false;
      player.shoot();
      break;
  }
})

window.addEventListener("mousemove", (event) => {
  socket.emit("rotationUpdate", {x: event.clientX, y: event.clientY})
})

window.addEventListener("mousedown", (event) => {
  socket.emit("moveUpdate", true)
})
window.addEventListener("mouseup", (event) => {
  socket.emit("moveUpdate", false)
})