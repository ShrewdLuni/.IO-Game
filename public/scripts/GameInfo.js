const dot = document.getElementById('dot');
const cordinatesTextBox = document.getElementById('cordinates');

const upgrades = ["Regeneration", "Max Health", "Bullet Speed", "Damage", "Shooting Speed", "Rotation Speed", "Movement Speed" ];

const upgradesContainer = document.querySelector('.upgrades');

upgrades.map(upgrade => {
  const upgradeButton = document.createElement('button');
  upgradeButton.textContent = upgrade;

  upgradeButton.setAttribute('style', `
    padding: 10px;
    margin: 5px;
    font-size: 20px;
    border: 1px solid white;
    background-color: black;
    color: white;
  `);

  upgradeButton.onclick = function test(){
    console.log(upgrade)
  }

  upgradesContainer.appendChild(upgradeButton);
  console.log(upgradesContainer)
});

function test(name){
  console.log(name)
}

function updateCordinates(x, y) {
  cordinatesTextBox.textContent = `x: ${x} y:${y}`
  dot.style.left = `${x / 40}px`;
  dot.style.top = `${y / 40}px`;
}