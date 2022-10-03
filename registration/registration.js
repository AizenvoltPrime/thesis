"use strict";

function registration_validation() {
  let uname = document.forms["registration-form"]["username"].value;
  let upass = document.forms["registration-form"]["password"].value;
  let upassc = document.forms["registration-form"]["password_confirm"].value;
  let uemail = document.forms["registration-form"]["email"].value;

  if (uname === "") {
    document.getElementById("user-help").innerHTML = "Username field is empty!";
    document.getElementById("pass-help").innerHTML = "";
    document.getElementById("passc-help").innerHTML = "";
    document.getElementById("email-help").innerHTML = "";
    document.getElementById("reg-form").style.height = "43em";
  } else if (upass === "") {
    document.getElementById("pass-help").innerHTML = "Password field is empty!";
    document.getElementById("user-help").innerHTML = "";
    document.getElementById("passc-help").innerHTML = "";
    document.getElementById("email-help").innerHTML = "";
    document.getElementById("reg-form").style.height = "43em";
  } else if (upassc === "") {
    document.getElementById("passc-help").innerHTML =
      "Password Confirmation field is empty!";
    document.getElementById("user-help").innerHTML = "";
    document.getElementById("pass-help").innerHTML = "";
    document.getElementById("email-help").innerHTML = "";
    document.getElementById("reg-form").style.height = "43em";
  } else if (uemail === "") {
    document.getElementById("email-help").innerHTML = "Email field is empty!";
    document.getElementById("user-help").innerHTML = "";
    document.getElementById("pass-help").innerHTML = "";
    document.getElementById("passc-help").innerHTML = "";
    document.getElementById("reg-form").style.height = "43em";
  } else if (uname.length < 6 || uname.length > 16) {
    document.getElementById("user-help").innerHTML =
      "Username must be between 6 and 16 characters!";
    document.getElementById("reg-form").style.height = "43em";
  } else if (uname.indexOf(" ") > 0) {
    document.getElementById("user-help").innerHTML =
      "Username must not have spaces!";
    document.getElementById("pass-help").innerHTML = "";
    document.getElementById("passc-help").innerHTML = "";
    document.getElementById("email-help").innerHTML = "";
    document.getElementById("reg-form").style.height = "43em";
  } else if (upass !== upassc) {
    document.getElementById("pass-help").innerHTML = "Passwords must match!";
    document.getElementById("user-help").innerHTML = "";
    document.getElementById("passc-help").innerHTML = "";
    document.getElementById("email-help").innerHTML = "";
    document.getElementById("reg-form").style.height = "43em";
  } else if (upass.length < 8) {
    document.getElementById("pass-help").innerHTML =
      "Password must be at least 8 characters!";
    document.getElementById("user-help").innerHTML = "";
    document.getElementById("passc-help").innerHTML = "";
    document.getElementById("email-help").innerHTML = "";
    document.getElementById("reg-form").style.height = "43em";
  } else if (upass.indexOf(" ") > 0) {
    document.getElementById("pass-help").innerHTML =
      "Password must not have spaces!";
    document.getElementById("reg-form").style.height = "43em";
  } else if (
    !/[A-Z]/g.test(upass) ||
    !/[0-9]/g.test(upass) ||
    !/[.!@#$&*]/g.test(upass)
  ) {
    document.getElementById("pass-help").innerHTML =
      "Password must contain at least 8 character and must also contain, at least one capital letter, a digit and one of these symbols(e.g. .!#$*&@)!";
    document.getElementById("user-help").innerHTML = "";
    document.getElementById("passc-help").innerHTML = "";
    document.getElementById("email-help").innerHTML = "";
    document.getElementById("reg-form").style.height = "45em";
  } else {
    $.ajax({
      type: "POST",
      url: "user_registration.php",
      dataType: "text",
      data: {
        username: uname,
        password: upass,
        email: uemail,
      },
      cache: false,
      success: function (res) {
        if (res.trim() === "This username is already taken.") {
          document.getElementById("user-help").innerHTML =
            "This username is already taken!";
          document.getElementById("pass-help").innerHTML = "";
          document.getElementById("passc-help").innerHTML = "";
          document.getElementById("email-help").innerHTML = "";
          document.getElementById("reg-form").style.height = "43em";
        } else if (res.trim() === "This email is already being used.") {
          document.getElementById("email-help").innerHTML =
            "This email is already being used!";
          document.getElementById("user-help").innerHTML = "";
          document.getElementById("pass-help").innerHTML = "";
          document.getElementById("passc-help").innerHTML = "";
          document.getElementById("reg-form").style.height = "43em";
        } else if (res.trim() === "Please enter a valid email address") {
          document.getElementById("email-help").innerHTML =
            "Please enter a valid email address";
          document.getElementById("user-help").innerHTML = "";
          document.getElementById("pass-help").innerHTML = "";
          document.getElementById("passc-help").innerHTML = "";
          document.getElementById("reg-form").style.height = "43em";
        } else if (
          res.trim() === "Something went wrong! Please try again later!"
        ) {
          document.getElementById("user-help").innerHTML = "";
          document.getElementById("pass-help").innerHTML =
            "Something went wrong! Please try again later!";
          document.getElementById("reg-form").style.height = "43em";
        } else if (res.trim() === "Success") {
          window.location = "http://localhost/project/login/login.php";
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
      if(mouseClickWidth>=300){
        document.getElementById("sidenav").style.width = "0";
        document.getElementById("sidenav-icon").style.visibility = "visible";
      }
      if(mouseClickWidth<=window.innerWidth-300){
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