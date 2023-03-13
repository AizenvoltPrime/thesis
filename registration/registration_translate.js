let translator = new Translator({
  defaultLanguage: "en",
});

Promise.all([
  fetch("../site_languages/greek.json")
    .then((response) => response.json())
    .then((data) => {
      translator.add("el", data);
    }),
  fetch("../site_languages/english.json")
    .then((response) => response.json())
    .then((data) => {
      translator.add("en", data);
    }),
]).then(() => {
  transalte_page();
});

document.getElementsByClassName("nav-element")[2].addEventListener("click", function () {
  if (window.getComputedStyle(document.getElementById("language")).display !== "none") {
    document.getElementById("language").style.display = "none";
    document.querySelectorAll(".user-nav a")[1].style.borderBottom = "0.0625em solid black";
  } else {
    document.getElementById("language").style.display = "flex";
    document.querySelectorAll(".user-nav a")[1].style.borderBottom = "0.0625em solid #2c3134";
  }
});

document.getElementById("en").addEventListener("click", function (event) {
  event.target.style.backgroundColor = "#00ffd0";
  document.getElementById("el").style.backgroundColor = "#007e7e";
  document.getElementById("language").style.display = "none";
  document.querySelectorAll(".user-nav a")[1].style.borderBottom = "0.0625em solid black";
  translator.translatePageTo("en");
  localStorage.setItem("language", "en");
  transalte_page();
  document.getElementById("user-nav").style.width = "0";
  document.getElementById("profile-icon").style.visibility = "visible";
});

document.getElementById("el").addEventListener("click", function (event) {
  event.target.style.backgroundColor = "#00ffd0";
  document.getElementById("en").style.backgroundColor = "#007e7e";
  document.getElementById("language").style.display = "none";
  document.querySelectorAll(".user-nav a")[1].style.borderBottom = "0.0625em solid black";
  translator.translatePageTo("el");
  localStorage.setItem("language", "el");
  transalte_page();
  document.getElementById("user-nav").style.width = "0";
  document.getElementById("profile-icon").style.visibility = "visible";
});

function transalte_page() {
  if (localStorage.getItem("language") === "el") {
    translator.translatePageTo("el");
    document.querySelector('input[name="username"]').placeholder = "Όνομα Χρήστη";
    document.querySelector('input[name="password"]').placeholder = "Κωδικός";
    document.querySelector('input[name="password_confirm"]').placeholder = "Επανάληψη Κωδικού";
    document.querySelector("#sum").value = "Υποβολή";
    document.getElementById("el").style.backgroundColor = "#00ffd0";
  } else {
    translator.translatePageTo("en");
    localStorage.setItem("language", "en");
    document.querySelector('input[name="username"]').placeholder = "Username";
    document.querySelector('input[name="password"]').placeholder = "Password";
    document.querySelector('input[name="password_confirm"]').placeholder = "Repeat Password";
    document.querySelector("#sum").value = "Submit";
    document.getElementById("en").style.backgroundColor = "#00ffd0";
  }
}
