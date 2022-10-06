"use strict";

let user_choice = "none";
let user_yes_no_answer = [0, 0];
let node = [];
let clone = [];

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
  fetch("process_data.php", {
    method: "POST",
    body: JSON.stringify({ request: "user_status" }),
  })
    .then((res) => res.text())
    .then((response) => {
      if (response === "false") {
        document.getElementsByClassName("nav-element")[3].style.display = "none";
      } else {
        document.getElementsByClassName("nav-element")[1].style.display = "none";
        document.getElementsByClassName("nav-element")[2].style.display = "none";
      }
    });
  document.getElementById("user-nav").style.width = "18.75em";
  document.getElementById("profile-icon").style.visibility = "hidden";
});

document.getElementsByClassName("closeuserbtn")[0].addEventListener("click", function () {
  document.getElementById("user-nav").style.width = "0";
  document.getElementById("profile-icon").style.visibility = "visible";
});

document.getElementById("hot").addEventListener("click", function () {
  highlight_filter("fa-fire-flame-curved");
  null_style("fa-sun");
  null_style("fa-table-list");
  null_style("fa-filter");
  null_style("fa-magnifying-glass");
});

document.getElementById("recent").addEventListener("click", function () {
  highlight_filter("fa-sun");
  null_style("fa-fire-flame-curved");
  null_style("fa-table-list");
  null_style("fa-filter");
  null_style("fa-magnifying-glass");
});

document.getElementById("preferred-categories").addEventListener("click", function () {
  highlight_filter("fa-table-list");
  null_style("fa-fire-flame-curved");
  null_style("fa-sun");
  null_style("fa-filter");
  null_style("fa-magnifying-glass");
});

document.getElementById("filter").addEventListener("click", function () {
  highlight_filter("fa-filter");
  null_style("fa-fire-flame-curved");
  null_style("fa-sun");
  null_style("fa-table-list");
  null_style("fa-magnifying-glass");
});

document.getElementById("search").addEventListener("click", function () {
  highlight_filter("fa-magnifying-glass");
  null_style("fa-fire-flame-curved");
  null_style("fa-sun");
  null_style("fa-filter");
  null_style("fa-table-list");
});

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

document.getElementById("add-post-icon").addEventListener("click", function () {
  fetch("process_data.php", {
    method: "POST",
    body: JSON.stringify({ request: "user_status" }),
  })
    .then((res) => res.text())
    .then((response) => {
      if (response === "false") {
        window.location = "login/login.php";
      } else {
        $("#add-post-icon").fadeOut(300, function () {});
        $(".post").fadeOut(300, function () {});
        $(".post").not(":first").remove();
        $("#all-filters").fadeOut(300, function () {
          document.getElementById("poll-selection").style.display = "flex";
          document.getElementById("poll-selection").style.animation = "fade_in_show 0.5s";
          document.getElementById("poll-question").style.display = "flex";
          document.getElementById("poll-question").style.animation = "fade_in_show 0.5s";
          $("#sum").fadeIn(300, function () {});
        });
      }
    });
});

document.getElementById("yes-no").addEventListener("click", function () {
  choice_highlight("yes-no", "rating", "approval", "ranking");
});

document.getElementById("rating").addEventListener("click", function () {
  choice_highlight("rating", "yes-no", "approval", "ranking");
});

document.getElementById("approval").addEventListener("click", function () {
  choice_highlight("approval", "yes-no", "rating", "ranking");
});

document.getElementById("ranking").addEventListener("click", function () {
  choice_highlight("ranking", "yes-no", "rating", "approval");
});

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

document.getElementById("sum").addEventListener("click", function () {
  let question_text = document.forms["poll-question"]["question-text"].value;
  if (user_choice === "none") {
    $("#warning-nothing-selected").fadeIn(300, function () {});
  } else if ($("#question").val().trim().length < 15) {
    $("#warning-empty-text-area").fadeIn(300, function () {});
  } else if (user_choice !== "none" && $("#question").val().trim().length >= 1) {
    fetch("process_data.php", {
      method: "POST",
      body: JSON.stringify({ request: "upload_post_data", question: question_text, poll_choice: user_choice }),
    })
      .then((res) => res.text())
      .then((response) => {
        $("#warning-nothing-selected").fadeOut(300, function () {});
        $("#warning-empty-text-area").fadeOut(300, function () {});
        $("#poll-selection").fadeOut(300, function () {});
        $("#poll-question").fadeOut(300, function () {
          $("#sum").fadeOut(300, function () {});
          $("#all-filters").fadeIn(300, function () {});
          $("#add-post-icon").fadeIn(300, function () {});
          document.querySelectorAll(".post")[0].style.display = "flex";
          document.querySelectorAll(".post")[0].style.animation = "fade_in_show 0.5s";
          generate_posts();
        });
        choice_dehighlight(user_choice);
        user_choice = "none";
        document.forms["poll-question"]["question-text"].value = "";
      });
  }
});

document.getElementsByClassName("answer")[0].addEventListener("click", function () {
  user_yes_no_answer = [1, 0];
});

document.getElementsByClassName("answer")[1].addEventListener("click", function () {
  user_yes_no_answer = [0, 1];
});

function generate_posts() {
  fetch("process_data.php", {
    method: "POST",
    body: JSON.stringify({ request: "get_post_data" }),
  })
    .then((res) => res.json())
    .then((response) => {
      let post_data = response;
      let post_time;
      for (let i = 0; i < post_data.length; i++) {
        post_time = moment(post_data[i][7], "YYYY-MM-DD HH:mm:ss").fromNow();
        let arr = post_data[i][7].split("-");
        let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        let month_index = parseInt(arr[1], 10) - 1;
        post_data[i][7] =
          post_data[i][7][8] +
          post_data[i][7][9] +
          " " +
          months[month_index] +
          "," +
          " " +
          arr[0] +
          "," +
          post_data[i][7][10] +
          post_data[i][7][11] +
          post_data[i][7][12] +
          post_data[i][7][13] +
          post_data[i][7][14] +
          post_data[i][7][15] +
          post_data[i][7][16] +
          post_data[i][7][17] +
          post_data[i][7][18];
        const d = new Date(post_data[i][7]);
        post_data[i][7] = days[d.getDay()] + "," + " " + post_data[i][7] + " UTC+3";
        if (i == 0) {
          document.getElementById("post-user-name").innerHTML = post_data[i][1];
          document.getElementsByClassName("post-question")[0].innerHTML = post_data[i][4];
          document.getElementsByClassName("score")[0].innerHTML = post_data[i][5];
          document.getElementsByClassName("score")[1].innerHTML = post_data[i][6];
          document.getElementById("post-time").innerHTML = post_time;
          document.getElementById("post-time-detailed").innerHTML = post_data[i][7];
        } else if (i > 0) {
          node[i - 1] = document.getElementsByClassName("post")[0];
          clone[i - 1] = node[i - 1].cloneNode(true);
          clone[i - 1].querySelector("#post-user-name").innerHTML = post_data[i][1];
          clone[i - 1].querySelectorAll(".post-question")[0].innerHTML = post_data[i][4];
          clone[i - 1].querySelectorAll(".score")[0].innerHTML = post_data[i][5];
          clone[i - 1].querySelectorAll(".score")[1].innerHTML = post_data[i][6];
          clone[i - 1].querySelector("#post-time").innerHTML = post_time;
          clone[i - 1].querySelector("#post-time-detailed").innerHTML = post_data[i][7];
          document.getElementById("posts-container").appendChild(clone[i - 1]);
        }
      }
      console.log(post_data);
    });
}

generate_posts();

const postContainer = document.querySelector("#posts-container");

postContainer.addEventListener(
  "click",
  (e) => {
    const btn = e.target.closest('button[data-dir="up"]');
    if (!btn) return;
    const post = btn.closest(".post");
    const postIndex = [...postContainer.children].indexOf(post);
  },
  { passive: true }
);
