const statsContainer = document.getElementById("stats");

async function fetchProfileData() {
  const pathParts = window.location.pathname.split("/");
  username =  pathParts[pathParts.length - 1];
  try {
    const response = await fetch(`/api/profile/${username}`);
    if (!response.ok) {
      throw new Error("Failed to fetch profile data");
    }
    const profileData = await response.json();
    return profileData;
  } catch (error) {
    console.error("Error fetching profile data:", error);
    return null;
  }
}

function updateStatsUI(profileData) {
  statsContainer.innerHTML = "";

  const stats = [
    { label: "Kills", value: profileData.userStats.kill_count },
    { label: "Deaths", value: profileData.userStats.death_count },
    { label: "K/D", value: (profileData.userStats.kill_count / profileData.userStats.death_count).toFixed(2) },
    { label: "Time In Game", value: `${(profileData.userStats.time_in_game / 60).toFixed(1)} min` },
    { label: "Damage Dealt", value: profileData.userStats.damage_dealed },
    { label: "Damage Absorbed", value: profileData.userStats.damage_absorbed },
  ];

  stats.forEach((stat) => {
    const statElement = document.createElement("div");

    const statName = document.createElement("p");
    statName.textContent = stat.label;
    statName.classList.add("statName")

    const statValue = document.createElement("p");
    statValue.textContent = stat.value || "N/A";

    if (typeof stat.value === 'number' && stat.value < 100) {
      statValue.textContent = stat.value.toFixed(2);
    } else {
      statValue.textContent = stat.value;
    }

    statValue.classList.add("statValue")

    statElement.appendChild(statName);
    statElement.appendChild(statValue);
    statsContainer.appendChild(statElement);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const profileData = await fetchProfileData();
  if (profileData) {
    updateStatsUI(profileData);
  } else {
    statsContainer.textContent = "Failed to load stats.";
  }
});