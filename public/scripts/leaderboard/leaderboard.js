const allTimeButton = document.getElementById("allTimeButton");
const todayButton = document.getElementById("todayButton");

function onAllTimeClick() {
  allTimeButton.classList.add("active")
  todayButton.classList.remove("active")
}

function onTodayClick(){
  todayButton.classList.add("active")
  allTimeButton.classList.remove("active")
}