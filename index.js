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
}

document.addEventListener("click", handleMousePos);

$.ajax({
  type: "POST",
  url: "process_data.php",
  success: function (res) {
    if (res === "false")
    {
      document.getElementsByClassName('nav-element')[1].style.display = "none";
    }
  },
});