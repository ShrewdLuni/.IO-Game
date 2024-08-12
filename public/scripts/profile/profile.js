const statsContainer = document.getElementById("statsContainer");

statsCategories = ["Kills", "Death", "K/D", "Time In Game", "Damage Dealed", "Damage Absorbed"]

statsCategories.map(stat => {
  const statElement = document.createElement("div");

  const statName = document.createElement("p");
  statName.textContent = stat;

  const statValue = document.createElement("p");
  statValue.textContent = "123";

  statElement.appendChild(statName);
  statElement.appendChild(statValue);
  statsContainer.appendChild(statElement);
});
