const upgrades = ["Regeneration", "Max Health", "Bullet Speed", "Damage", "Shooting Speed", "Maneuverability", "Movement Speed" ];

const upgradesContainer = document.querySelector('.upgrades');

//remove
// const usernameInput = document.getElementById("usernameInput")
// const menu = document.getElementById("menu")
// const gameInformation = document.getElementById("gameInformation")
// const blurElement = document.querySelector(".blur");
// blurElement.classList.add("hidden")
// menu.classList.add("hidden")
// gameInformation.classList.remove("hidden")
//remove


upgrades.map(upgrade => {
  const upgradeDiv = document.createElement('div');
  upgradeDiv.textContent = upgrade;

  upgradeDiv.setAttribute('style', `
    padding: 10px;
    margin: 5px;
    font-size: 20px;
    border: 1px solid white;
    background-color: black;
  `);

  upgradesContainer.appendChild(upgradeDiv);
  console.log(upgradesContainer)
});