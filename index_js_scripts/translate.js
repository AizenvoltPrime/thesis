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
  document.querySelectorAll(".user-nav a")[5].style.borderBottom = "0.0625em solid #2c3134";
  $("#language").fadeIn(300, function () {});
  document.getElementById("language").style.display = "flex";
});

document.getElementById("en").addEventListener("click", function (event) {
  event.target.style.backgroundColor = "#00ffd0";
  document.getElementById("el").style.backgroundColor = "#007e7e";
  document.getElementsByClassName("nav-element")[0].click();
  $("#language").fadeOut(300, function () {});
  $("#language")
    .promise()
    .done(function () {
      document.querySelectorAll(".user-nav a")[5].style.borderBottom = "0.0625em solid black";
      translator.translatePageTo("en");
    });
});

document.getElementById("el").addEventListener("click", function (event) {
  event.target.style.backgroundColor = "#00ffd0";
  document.getElementById("en").style.backgroundColor = "#007e7e";
  document.getElementsByClassName("nav-element")[0].click();
  $("#language").fadeOut(300, function () {});
  $("#language")
    .promise()
    .done(function () {
      document.querySelectorAll(".user-nav a")[5].style.borderBottom = "0.0625em solid black";
      translator.translatePageTo("el");
    });
});
