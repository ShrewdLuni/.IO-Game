const table = document.getElementById("users-table")

function addUser(id, imgUrl, username, kills, kd) {
  const row = document.createElement('tr')
  row.innerHTML = `
  <td>${id}</td>
  <td>
    <div class="profile-container">
      <img src="${imgUrl}" alt="Profile Picture">
      <p>${username}</p>
    </div>
  </td>
  <td>${kills}</td>
  <td>${kd}</td>
  `
  table.append(row)
}

const lddata = [
  {
    id: 1,
    imgUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/800px-Cat03.jpg",
    username: "PlayerOne",
    kills: 32,
    kd: 4.0
  },
  {
    id: 2,
    imgUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/800px-Cat03.jpg",
    username: "PlayerTwo",
    kills: 20,
    kd: 3.5
  },
  {
    id: 3,
    imgUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/800px-Cat03.jpg",
    username: "PlayerThree",
    kills: 15,
    kd: 2.0
  }
];

lddata.forEach(user => {
  addUser(user.id, user.imgUrl, user.username, user.kills, user.kd);
});
