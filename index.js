"use strict";

let user_choice = "none";
let user_yes_no_answer = [0, 0];
let user_chevron_answer = [0, 0];

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
  $.ajax({
    type: "POST",
    url: "process_data.php",
    data: {
      request: "user_status",
    },
    success: function (res) {
      if (res === "false") {
        document.getElementsByClassName("nav-element")[3].style.display = "none";
      } else {
        document.getElementsByClassName("nav-element")[1].style.display = "none";
        document.getElementsByClassName("nav-element")[2].style.display = "none";
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

function hot() {
  highlight_filter("fa-fire-flame-curved");
  null_style("fa-sun");
  null_style("fa-table-list");
  null_style("fa-filter");
  null_style("fa-magnifying-glass");
}

function recent() {
  highlight_filter("fa-sun");
  null_style("fa-fire-flame-curved");
  null_style("fa-table-list");
  null_style("fa-filter");
  null_style("fa-magnifying-glass");
}

function preffered_categories() {
  highlight_filter("fa-table-list");
  null_style("fa-fire-flame-curved");
  null_style("fa-sun");
  null_style("fa-filter");
  null_style("fa-magnifying-glass");
}

function filter() {
  highlight_filter("fa-filter");
  null_style("fa-fire-flame-curved");
  null_style("fa-sun");
  null_style("fa-table-list");
  null_style("fa-magnifying-glass");
}

function search() {
  highlight_filter("fa-magnifying-glass");
  null_style("fa-fire-flame-curved");
  null_style("fa-sun");
  null_style("fa-filter");
  null_style("fa-table-list");
}

function null_style(class_name) {
  document.getElementsByClassName(class_name)[0].style.background = null;
  document.getElementsByClassName(class_name)[0].style.backgroundClip = null;
  document.getElementsByClassName(class_name)[0].style.webkitBackgroundClip = null;
  document.getElementsByClassName(class_name)[0].style.webkitTextFillColor = null;
}

function highlight_filter(class_name) {
  document.getElementsByClassName(class_name)[0].style.background = "-webkit-linear-gradient(200deg, #cc0000, #000)";
  document.getElementsByClassName(class_name)[0].style.backgroundClip = "text";
  document.getElementsByClassName(class_name)[0].style.webkitBackgroundClip = "text";
  document.getElementsByClassName(class_name)[0].style.webkitTextFillColor = "transparent";
}

function createPoll() {
  $.ajax({
    type: "POST",
    url: "process_data.php",
    data: {
      request: "user_status",
    },
    success: function (res) {
      if (res === "false") {
        window.location = "login/login.php";
      } else {
        $("#add-post-icon").fadeOut(300, function () {});
        $("#posts").fadeOut(300, function () {});
        $("#all-filters").fadeOut(300, function () {
          document.getElementById("poll-selection").style.display = "flex";
          document.getElementById("poll-selection").style.animation = "fade_in_show 0.5s";
          document.getElementById("poll-question").style.display = "flex";
          document.getElementById("poll-question").style.animation = "fade_in_show 0.5s";
          $("#sum").fadeIn(300, function () {});
        });
      }
    },
  });
}

function yes_no() {
  choice_highlight("yes-no", "rating", "approval", "ranking");
}

function rating() {
  choice_highlight("rating", "yes-no", "approval", "ranking");
}

function approval() {
  choice_highlight("approval", "yes-no", "rating", "ranking");
}

function ranking() {
  choice_highlight("ranking", "yes-no", "rating", "approval");
}

function choice_highlight(choice, dehigh1, dehigh2, dehigh3) {
  choice_dehighlight(dehigh1);
  choice_dehighlight(dehigh2);
  choice_dehighlight(dehigh3);
  document.getElementById(choice).style.border = "0.1em solid #cc0000";
  document.getElementById(choice).style.color = "#cc0000";
  user_choice = choice;
}

function choice_dehighlight(choice) {
  document.getElementById(choice).style.border = null;
  document.getElementById(choice).style.color = null;
}

function postPoll() {
  let question_text = document.forms["poll-question"]["question-text"].value;
  if (user_choice === "none") {
    $("#warning-nothing-selected").fadeIn(300, function () {});
  } else if ($("#question").val().trim().length < 15) {
    $("#warning-empty-text-area").fadeIn(300, function () {});
  } else if (user_choice !== "none" && $("#question").val().trim().length >= 1) {
    $.ajax({
      type: "POST",
      url: "process_data.php",
      data: {
        request: "upload_post_data",
        question: question_text,
        poll_choice: user_choice,
      },
      success: function (res) {
        console.log(res);
        $("#warning-nothing-selected").fadeOut(300, function () {});
        $("#warning-empty-text-area").fadeOut(300, function () {});
        $("#poll-selection").fadeOut(300, function () {});
        $("#poll-question").fadeOut(300, function () {
          $("#sum").fadeOut(300, function () {});
          $("#all-filters").fadeIn(300, function () {});
          $("#add-post-icon").fadeIn(300, function () {});
          document.getElementById("posts").style.display = "flex";
          document.getElementById("posts").style.animation = "fade_in_show 0.5s";

          $.ajax({
            type: "POST",
            url: "process_data.php",
            data: {
              request: "get_post_data",
            },
            success: function (res) {
              let post_data = JSON.parse(res);
              for (let i = 0; i < post_data.length; i++) {
                for (let j = 0; j < 6; j++) {
                  post_data[i][j] = post_data[i][j];
                }
                let arr = post_data[i][6].split("-");
                let months = [
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ];
                let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                let month_index = parseInt(arr[1], 10) - 1;
                post_data[i][6] =
                  post_data[i][6][8] +
                  post_data[i][6][9] +
                  " " +
                  months[month_index] +
                  "," +
                  " " +
                  arr[0] +
                  "," +
                  post_data[i][6][10] +
                  post_data[i][6][11] +
                  post_data[i][6][12] +
                  post_data[i][6][13] +
                  post_data[i][6][14] +
                  post_data[i][6][15] +
                  post_data[i][6][16] +
                  post_data[i][6][17] +
                  post_data[i][6][18];
                const d = new Date(post_data[i][6]);
                post_data[i][6] = days[d.getDay()] + "," + " " + post_data[i][6] + " UTC+3";
              }
              console.log(post_data);
            },
          });
        });
        choice_dehighlight(user_choice);
        user_choice = "none";
        document.forms["poll-question"]["question-text"].value = "";
      },
    });
  }
}

function answered_yes() {
  user_yes_no_answer = [1, 0];
}

function answered_no() {}
{
  user_yes_no_answer = [0, 1];
}

function answered_yes() {
  user_chevron_answer = [1, 0];
}

function answered_no() {}
{
  user_chevron_answer = [0, 1];
}

function answered_chevron_up() {}
