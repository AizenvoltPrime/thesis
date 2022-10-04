"use strict";

function login_validation() {
  let uname = document.forms["login-form"]["username"].value;
  let upass = document.forms["login-form"]["password"].value;

  if (uname === "") {
    document.getElementById("user-help").innerHTML = "Username field is empty!";
    document.getElementById("pass-help").innerHTML = "";
  } else if (upass === "") {
    document.getElementById("pass-help").innerHTML = "Password field is empty!";
    document.getElementById("user-help").innerHTML = "";
  } else {
    $.ajax({
      type: "POST",
      url: "user_login.php",
      dataType: "text",
      data: {
        username: uname,
        password: upass,
      },
      cache: false,
      success: function (res) {
        if (res.trim() === "Wrong Password") {
          document.getElementById("user-help").innerHTML = "";
          document.getElementById("pass-help").innerHTML = "Incorrect Username or Password!";
        } else if (res.trim() === "Wrong Username") {
          document.getElementById("user-help").innerHTML = "";
          document.getElementById("pass-help").innerHTML = "Incorrect Username or Password!";
        } else if (res.trim() === "Oops! Something went wrong! Please try again later!") {
          document.getElementById("user-help").innerHTML = "";
          document.getElementById("pass-help").innerHTML = "Oops! Something went wrong! Please try again later!";
        } else if (res.trim() === "Success") {
          window.location = "../index.php";
        }
      },
    });
  }
}

(function () {
  var c = document.getElementById("sum");
  function addAnim() {
    c.classList.add("animated");
    // remove the listener, no longer needed
    c.removeEventListener("mouseover", addAnim);
  }

  // listen to mouseover for the container
  c.addEventListener("mouseover", addAnim);
})();

function openNav() {
  document.getElementById("sidenav").style.width = "18.75em";
  document.getElementById("sidenav-icon").style.visibility = "hidden";
}

function closeNav() {
  document.getElementById("sidenav").style.width = "0";
  document.getElementById("sidenav-icon").style.visibility = "visible";
}

function handleMousePos(event) {
  var mouseClickWidth = event.clientX;
  if (mouseClickWidth >= 300) {
    document.getElementById("sidenav").style.width = "0";
    document.getElementById("sidenav-icon").style.visibility = "visible";
  }
  if (mouseClickWidth <= window.innerWidth - 300) {
    document.getElementById("user-nav").style.width = "0";
    document.getElementById("profile-icon").style.visibility = "visible";
  }
}

document.addEventListener("click", handleMousePos);

function openUserNav() {
  document.getElementById("user-nav").style.width = "18.75em";
  document.getElementById("profile-icon").style.visibility = "hidden";
}

function closeUserNav() {
  document.getElementById("user-nav").style.width = "0";
  document.getElementById("profile-icon").style.visibility = "visible";
}
