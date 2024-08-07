const usernameInput = document.getElementById("usernameInput")
const menu = document.getElementById("menu")
const gameInformation = document.getElementById("gameInformation")
const blurElement = document.querySelector(".blur");

function startGame()
{
  console.log(usernameInput.value)
  blurElement.classList.add("hidden")
  menu.classList.add("hidden")
  gameInformation.classList.remove("hidden")
}

function stopGame() {
  console.log("Died.");
  blurElement.classList.remove("hidden")
  menu.classList.remove("hidden")
  gameInformation.classList.add("hidden")
}