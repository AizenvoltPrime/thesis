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

function hot()
{
  highlight_filter("fa-fire-flame-curved");
  null_style("fa-sun");
  null_style("fa-table-list");
  null_style("fa-filter");
  null_style("fa-magnifying-glass");
}

function recent()
{
  highlight_filter("fa-sun");
  null_style("fa-fire-flame-curved");
  null_style("fa-table-list");
  null_style("fa-filter");
  null_style("fa-magnifying-glass");
}

function preffered_categories()
{
  highlight_filter("fa-table-list");
  null_style("fa-fire-flame-curved");
  null_style("fa-sun");
  null_style("fa-filter");
  null_style("fa-magnifying-glass");
}

function filter()
{
  highlight_filter("fa-filter");
  null_style("fa-fire-flame-curved");
  null_style("fa-sun");
  null_style("fa-table-list");
  null_style("fa-magnifying-glass");
}

function search()
{
  highlight_filter("fa-magnifying-glass");
  null_style("fa-fire-flame-curved");
  null_style("fa-sun");
  null_style("fa-filter");
  null_style("fa-table-list");
}

function null_style(class_name)
{
  document.getElementsByClassName(class_name)[0].style.background = null;
  document.getElementsByClassName(class_name)[0].style.backgroundClip = null;
  document.getElementsByClassName(class_name)[0].style.webkitBackgroundClip = null;
  document.getElementsByClassName(class_name)[0].style.webkitTextFillColor = null;
}

function highlight_filter(class_name)
{
  document.getElementsByClassName(class_name)[0].style.background = "-webkit-linear-gradient(200deg, #cc0000, #000)";
  document.getElementsByClassName(class_name)[0].style.backgroundClip = "text";
  document.getElementsByClassName(class_name)[0].style.webkitBackgroundClip = "text";
  document.getElementsByClassName(class_name)[0].style.webkitTextFillColor = "transparent";
}