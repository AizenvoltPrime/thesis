//This is for when the user clicks the left navbar icon for it to appear.
document.getElementById("sidenav-icon").addEventListener("click", function () {
  document.getElementById("sidenav").style.width = "18.75em";
  document.getElementById("sidenav-icon").style.visibility = "hidden";
});

//This is for when the user clicks the left navbar close icon for the navbar to disappear.
document.getElementsByClassName("closebtn")[0].addEventListener("click", function () {
  document.getElementById("sidenav").style.width = "0";
  document.getElementById("sidenav-icon").style.visibility = "visible";
});

//This is for the 2 navbars to close when user clicks outside them when they are open.
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

//This is for when the user clicks the right navbar icon for it to appear.
document.getElementById("profile-icon").addEventListener("click", function () {
  fetch("process_data.php", {
    method: "POST",
    body: JSON.stringify({ request: "user_status" }),
  })
    .then((res) => res.text())
    .then((response) => {
      if (response === "false") {
        document.getElementsByClassName("nav-element")[3].style.display = "none";
        document.getElementsByClassName("nav-element")[4].style.display = "none";
        document.getElementsByClassName("nav-element")[5].style.display = "none";
        document.getElementsByClassName("nav-element")[6].style.display = "none";
      } else {
        document.getElementsByClassName("nav-element")[1].style.display = "none";
        document.getElementsByClassName("nav-element")[2].style.display = "none";
        document.getElementsByClassName("nav-element")[3].style.cursor = "pointer";
        document.getElementsByClassName("fa-solid fa-bookmark fa-1x")[0].style.background = "-webkit-linear-gradient(200deg, #cc0000, #000)";
        document.getElementsByClassName("fa-solid fa-bookmark fa-1x")[0].style.backgroundClip = "text";
        document.getElementsByClassName("fa-solid fa-bookmark fa-1x")[0].style.webkitBackgroundClip = "text";
        document.getElementsByClassName("fa-solid fa-bookmark fa-1x")[0].style.webkitTextFillColor = "transparent";
        document.getElementsByClassName("fa-solid fa-bookmark fa-1x")[0].style.paddingRight = "0.35em";
        document.getElementsByClassName("fa-solid fa-user fa-1x")[0].style.paddingRight = "0.25em";
        document.getElementsByClassName("fa-solid fa-lock fa-1x")[0].style.paddingRight = "0.25em";
      }
    });
  document.getElementById("user-nav").style.width = "18.75em";
  document.getElementById("profile-icon").style.visibility = "hidden";
});

//This is for when the user clicks the right navbar close icon for the navbar to disappear.
document.getElementsByClassName("closeuserbtn")[0].addEventListener("click", function () {
  document.getElementById("user-nav").style.width = "0";
  document.getElementById("profile-icon").style.visibility = "visible";
});
