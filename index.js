"use strict";

let user_choice = "none";

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

function createPoll()
{
  $.ajax({
  type: "POST",
  url: "process_data.php",
  success: function (res) {
    if (res === "false")
    {
      window.location = "login/login.php";
    }
    else
    {
      $('#add-post-icon').fadeOut(300, function () {
      });
      $('#all-filters').fadeOut(300, function () {
        document.getElementById("poll-selection").style.display = "flex";
        document.getElementById("poll-selection").style.animation = "fade_in_show 0.5s";
        document.getElementById("poll-question").style.display = "flex";
        document.getElementById("poll-question").style.animation = "fade_in_show 0.5s";
      });
    }
  },
  });
}

function yes_no()
{
  choice_highlight("yes-no","rating","approval","ranking");
}

function rating()
{
  choice_highlight("rating","yes-no","approval","ranking");
}

function approval()
{
  choice_highlight("approval","yes-no","rating","ranking");
}

function ranking()
{
  choice_highlight("ranking","yes-no","rating","approval");
}

function choice_highlight(choice,dehigh1,dehigh2,dehigh3)
{
  choice_dehighlight(dehigh1);
  choice_dehighlight(dehigh2);
  choice_dehighlight(dehigh3);
  document.getElementById(choice).style.border = "0.1em solid #cc0000";
  document.getElementById(choice).style.color = "#cc0000";
  user_choice = choice;
}

function choice_dehighlight(choice)
{
  document.getElementById(choice).style.border = null;
  document.getElementById(choice).style.color = null;
}

function postPoll() {
  let question_text = document.forms["poll-question"]["question-text"].value;
}