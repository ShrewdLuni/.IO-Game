const dot = document.getElementById("dot");
const cordinatesTextBox = document.getElementById("cordinates");
const upgradesContainer = document.querySelector(".upgrades");
const scoreContainer = document.getElementById("scoreContainer");

// const upgrades = ["Regeneration", "Max Health", "Bullet Speed", "Damage", "Shooting Speed", "Rotation Speed", "Movement Speed" ];

// upgrades.map(upgrade => {
//   const upgradeButton = document.createElement("button");
//   upgradeButton.textContent = upgrade;

//   upgradeButton.setAttribute("style", `
//     padding: 10px;
//     margin: 5px;
//     font-size: 20px;
//     border: 1px solid white;
//     background-color: black;
//     color: white;
//   `);

//   upgradeButton.onclick = function click(){
//     socket.emit("statsUpgrade", upgrade);
//   }

//   upgradesContainer.appendChild(upgradeButton);
// });

function updateLeaderboard(players){
  scoreContainer.innerHTML = "";
  Object.values(players).sort((a, b) => b.currentState.score - a.currentState.score).forEach(player => {
    const score = document.createElement("div");
    score.textContent = player.username + " " + player.currentState.score;
  
    scoreContainer.appendChild(score);
  });
}

function updateCordinates(x, y) {
  cordinatesTextBox.textContent = `x: ${x} y:${y}`
  dot.style.left = `${x / 40}px`;
  dot.style.top = `${y / 40}px`;
}