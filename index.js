"use strict";

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
  $.ajax({
  type: "POST",
  url: "process_data.php",
  success: function (res) {
    if (res === "false")
    {
      document.getElementsByClassName('nav-element')[3].style.display = "none";
    }
    else
    {
      document.getElementsByClassName('nav-element')[1].style.display = "none";
      document.getElementsByClassName('nav-element')[2].style.display = "none";
    }
  },
  });
  document.getElementById("user-nav").style.width = "18.75em";
  document.getElementById("profile-icon").style.visibility = "hidden";
}

function closeUserNav() {
  document.getElementById("user-nav").style.width = "0";
  document.getElementById("profile-icon").style.visibility = "visible";
}