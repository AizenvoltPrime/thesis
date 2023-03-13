import { get_variables } from "./index.js";

let translator = new Translator({
  defaultLanguage: "en",
});

fetch("./site_languages/greek.json")
  .then((response) => response.json())
  .then((data) => {
    translator.add("el", data);
  });

fetch("./site_languages/english.json")
  .then((response) => response.json())
  .then((data) => {
    translator.add("en", data);
  });

export { translator };

document.getElementsByClassName("nav-element")[8].addEventListener("click", function () {
  if (window.getComputedStyle(document.getElementById("language")).display !== "none") {
    document.getElementById("language").style.display = "none";
    document.querySelectorAll(".user-nav a")[5].style.borderBottom = "0.0625em solid black";
  } else {
    document.getElementById("language").style.display = "flex";
    document.querySelectorAll(".user-nav a")[5].style.borderBottom = "0.0625em solid #2c3134";
  }
});

document.getElementById("en").addEventListener("click", function (event) {
  event.target.style.backgroundColor = "#00ffd0";
  document.getElementById("el").style.backgroundColor = "#007e7e";
  if (get_variables()[2] > 16) {
    fetch("process_data.php", {
      method: "POST",
      body: JSON.stringify({
        request: "language_data",
        language: "en",
      }),
    })
      .then((res) => res.text())
      .then((response) => {
        document.getElementsByClassName("nav-element")[0].click();
        $("#language").fadeOut(300, function () {});
        $("#language")
          .promise()
          .done(function () {
            document.querySelectorAll(".user-nav a")[5].style.borderBottom = "0.0625em solid black";
            translator.translatePageTo("en");
            localStorage.setItem("language", "en");
          });
      });
  } else {
    document.getElementsByClassName("nav-element")[0].click();
    $("#language").fadeOut(300, function () {});
    $("#language")
      .promise()
      .done(function () {
        document.querySelectorAll(".user-nav a")[5].style.borderBottom = "0.0625em solid black";
        translator.translatePageTo("en");
        localStorage.setItem("language", "en");
      });
  }
});

document.getElementById("el").addEventListener("click", function (event) {
  event.target.style.backgroundColor = "#00ffd0";
  document.getElementById("en").style.backgroundColor = "#007e7e";
  if (get_variables()[2] > 16) {
    fetch("process_data.php", {
      method: "POST",
      body: JSON.stringify({
        request: "language_data",
        language: "el",
      }),
    })
      .then((res) => res.text())
      .then((response) => {
        document.getElementsByClassName("nav-element")[0].click();
        $("#language").fadeOut(300, function () {});
        $("#language")
          .promise()
          .done(function () {
            document.querySelectorAll(".user-nav a")[5].style.borderBottom = "0.0625em solid black";
            translator.translatePageTo("el");
            localStorage.setItem("language", "el");
          });
      });
  } else {
    document.getElementsByClassName("nav-element")[0].click();
    $("#language").fadeOut(300, function () {});
    $("#language")
      .promise()
      .done(function () {
        document.querySelectorAll(".user-nav a")[5].style.borderBottom = "0.0625em solid black";
        translator.translatePageTo("el");
        localStorage.setItem("language", "el");
      });
  }
});
