let request_send = false;
document.getElementById("sum").addEventListener("click", function () {
  let uname = document.forms["login-form"]["username"].value;
  let upass = document.forms["login-form"]["password"].value;

  if (uname === "") {
    if (localStorage.getItem("language") === "el") {
      document.getElementById("user-help").innerText = "Το όνομα χρήστη δεν έχει συμπληρωθεί";
    } else {
      document.getElementById("user-help").innerText = "Username field is empty";
    }
    document.getElementById("pass-help").innerText = "";
  } else if (upass === "") {
    if (localStorage.getItem("language") === "el") {
      document.getElementById("pass-help").innerText = "Ο κωδικός χρήστη δεν έχει συμπληρωθεί";
    } else {
      document.getElementById("pass-help").innerText = "Password field is empty";
    }
    document.getElementById("user-help").innerText = "";
  } else if (request_send === false) {
    request_send = true;
    fetch("https://ipinfo.io/json?token=ffc97ce1d646e9")
      .then((response) => response.json())
      .then((jsonResponse) => {
        const loc = jsonResponse.loc.split(",");
        const coords = {
          latitude: loc[0],
          longitude: loc[1],
        };
        fetch("user_login.php", {
          method: "POST",
          body: JSON.stringify({ username: uname, password: upass, latitude: coords.latitude, longitude: coords.longitude }),
        })
          .then((res) => res.text())
          .then((response) => {
            if (response.trim() === "Wrong Password") {
              request_send = false;
              document.getElementById("user-help").innerText = "";
              if (localStorage.getItem("language") === "el") {
                document.getElementById("pass-help").innerText = "Λάθος όνομα χρήστη ή κωδικός";
              } else {
                document.getElementById("pass-help").innerText = "Incorrect Username or Password";
              }
            } else if (response.trim() === "Wrong Username") {
              request_send = false;
              document.getElementById("user-help").innerText = "";
              if (localStorage.getItem("language") === "el") {
                document.getElementById("pass-help").innerText = "Λάθος όνομα χρήστη ή κωδικός";
              } else {
                document.getElementById("pass-help").innerText = "Incorrect Username or Password";
              }
            } else if (response.trim() === "Oops! Something went wrong! Please try again later!") {
              request_send = false;
              document.getElementById("user-help").innerText = "";
              if (localStorage.getItem("language") === "el") {
                document.getElementById("pass-help").innerText = "Κάτι πήγε λάθος. Παρακαλώ δοκιμάστε ξανά.";
              } else {
                document.getElementById("pass-help").innerText = "Oops. Something went wrong. Please try again later.";
              }
            } else if (response.trim() === "Success") {
              window.location = "../index.php";
            }
          });
      });
  }
});

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

document.getElementById("sidenav-icon").addEventListener("click", function () {
  document.getElementById("sidenav").style.width = "18.75em";
  document.getElementById("sidenav-icon").style.visibility = "hidden";
});

document.getElementsByClassName("closebtn")[0].addEventListener("click", function () {
  document.getElementById("sidenav").style.width = "0";
  document.getElementById("sidenav-icon").style.visibility = "visible";
});

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

document.getElementById("profile-icon").addEventListener("click", function () {
  document.getElementById("user-nav").style.width = "18.75em";
  document.getElementById("profile-icon").style.visibility = "hidden";
});

document.getElementsByClassName("closeuserbtn")[0].addEventListener("click", function () {
  document.getElementById("user-nav").style.width = "0";
  document.getElementById("profile-icon").style.visibility = "visible";
});
