const dot = document.getElementById('dot');
const cordinatesTextBox = document.getElementById('cordinates');

const upgrades = ["Regeneration", "Max Health", "Bullet Speed", "Damage", "Shooting Speed", "Maneuverability", "Movement Speed" ];

const upgradesContainer = document.querySelector('.upgrades');

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

function updateCordinates(x, y) {
  cordinatesTextBox.textContent = `x: ${x} y:${y}`
  dot.style.left = `${x / 40}px`;
  dot.style.top = `${y / 40}px`;
}