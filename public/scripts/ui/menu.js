const usernameInput = document.getElementById("usernameInput")
const menu = document.getElementById("menu")
const gameInformation = document.getElementById("gameInformation")
const blurElement = document.querySelector(".blur");

function startGame() {
  isAlive = true;
  socket.emit("startGame", usernameInput.value);
  blurElement.classList.add("hidden")
  menu.classList.add("hidden")
  gameInformation.classList.remove("hidden")
}

function stopGame() {
  isAlive = false;
  console.log("Died.");
  blurElement.classList.remove("hidden")
  menu.classList.remove("hidden")
  gameInformation.classList.add("hidden")
}