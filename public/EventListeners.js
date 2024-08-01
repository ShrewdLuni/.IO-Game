window.addEventListener("keydown", (event) => {
  switch(event.code){
    case "KeyW":
      console.log(1)
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
      console.log(2);
      socket.emit("moveUpdate", false)
      break
    case "Space":
      // actions.shoot.isActive = false;
      player.shoot();
      break;
  }
})

window.addEventListener("mousemove", (event) => {
  mousePosition.x = event.clientX;
  mousePosition.y = event.clientY;
})

window.addEventListener("mousedown", (event) => {
  actions.move.isActive = true;
})
window.addEventListener("mouseup", (event) => {
  actions.move.isActive = false;
})
