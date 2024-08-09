const dot = document.getElementById("dot");
const cordinatesTextBox = document.getElementById("cordinates");

const upgrades = ["Regeneration", "Max Health", "Bullet Speed", "Damage", "Shooting Speed", "Rotation Speed", "Movement Speed" ];

const upgradesContainer = document.querySelector(".upgrades");

upgrades.map(upgrade => {
  const upgradeButton = document.createElement("button");
  upgradeButton.textContent = upgrade;

  upgradeButton.setAttribute("style", `
    padding: 10px;
    margin: 5px;
    font-size: 20px;
    border: 1px solid white;
    background-color: black;
    color: white;
  `);

  upgradeButton.onclick = function click(){
    socket.emit("statsUpgrade", upgrade);
  }

  upgradesContainer.appendChild(upgradeButton);
});


function updateLeaderboard(players){
  leaderboard.innerHTML = "";
  Object.values(players).forEach(player => {
    const score = document.createElement("div");
    score.textContent = "username" + " " + player.currentState.score;
  
    leaderboard.appendChild(score);
  });
}

function updateCordinates(x, y) {
  cordinatesTextBox.textContent = `x: ${x} y:${y}`
  dot.style.left = `${x / 40}px`;
  dot.style.top = `${y / 40}px`;
}