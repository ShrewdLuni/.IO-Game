window.addEventListener("keydown", (event) => {
  switch(event.code){
    case "KeyW":
      actions.move.isActive = true;
      break
    case "Space":
      actions.shoot.isActive = true;
      break;
  }
})

window.addEventListener("keyup", (event) => {
  switch(event.code){
    case "KeyW":
      actions.move.isActive = false;
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
