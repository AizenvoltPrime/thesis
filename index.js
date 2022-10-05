"use strict";

let user_choice = "none";
let user_yes_no_answer = [0, 0];
let user_chevron_answer = [0, 0];
let number_of_cloned_posts = 0;
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
        $("#post").fadeOut(300, function () {});
        if (number_of_cloned_posts > 0) {
          for (let i = 0; i < number_of_cloned_posts; i++) {
            let temp = "#cloned_post" + i;
            $(temp).fadeOut(300, function () {});
            temp = "cloned_post" + i;
            document.getElementById(temp).remove();
          }
        }
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
          document.getElementById("post").style.display = "flex";
          document.getElementById("post").style.animation = "fade_in_show 0.5s";
          generate_posts();
        });
        choice_dehighlight(user_choice);
        user_choice = "none";
        document.forms["poll-question"]["question-text"].value = "";
      },
    });
  }
});

document.getElementsByClassName("answer")[0].addEventListener("click", function () {
  user_yes_no_answer = [1, 0];
});

document.getElementsByClassName("answer")[1].addEventListener("click", function () {
  user_yes_no_answer = [0, 1];
});

document.getElementsByClassName("fa-solid fa-chevron-up")[0].addEventListener("click", function () {});

document.getElementsByClassName("fa-solid fa-chevron-down")[0].addEventListener("click", function () {});

function generate_posts() {
  number_of_cloned_posts = 0;
  $.ajax({
    type: "POST",
    url: "process_data.php",
    data: {
      request: "get_post_data",
    },
    success: function (res) {
      let post_data = JSON.parse(res);
      let post_time;
      let clone_name;
      for (let i = 0; i < post_data.length; i++) {
        post_time = moment(post_data[i][6], "YYYY-MM-DD HH:mm:ss").fromNow();
        let arr = post_data[i][6].split("-");
        let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
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
        if (i == 0) {
          document.getElementById("post-user-name").innerHTML = post_data[i][0];
          document.getElementsByClassName("post-question")[0].innerHTML = post_data[i][3];
          document.getElementsByClassName("score")[0].innerHTML = post_data[i][4];
          document.getElementsByClassName("score")[1].innerHTML = post_data[i][5];
          document.getElementById("post-time").innerHTML = post_time;
          document.getElementById("post-time-detailed").innerHTML = post_data[i][6];
        } else if (i > 0) {
          number_of_cloned_posts++;
          clone_name = "cloned_post" + (i - 1);
          node[i - 1] = document.getElementById("post");
          clone[i - 1] = node[i - 1].cloneNode(true);
          clone[i - 1].setAttribute("id", clone_name);
          console.log(clone_name);
          clone[i - 1].querySelector("#post-user-name").innerHTML = post_data[i][0];
          clone[i - 1].querySelectorAll(".post-question")[0].innerHTML = post_data[i][3];
          clone[i - 1].querySelectorAll(".score")[0].innerHTML = post_data[i][4];
          clone[i - 1].querySelectorAll(".score")[1].innerHTML = post_data[i][5];
          clone[i - 1].querySelector("#post-time").innerHTML = post_time;
          clone[i - 1].querySelector("#post-time-detailed").innerHTML = post_data[i][6];
          document.getElementById("posts-container").appendChild(clone[i - 1]);
          document.getElementById(clone_name).style.display = "flex";
          document.getElementById(clone_name).style.backgroundColor = "#2c3134";
          document.getElementById(clone_name).style.justifyContent = "start";
          document.getElementById(clone_name).style.height = "fit-content";
          document.getElementById(clone_name).style.marginLeft = "auto";
          document.getElementById(clone_name).style.marginRight = "auto";
          document.getElementById(clone_name).style.marginTop = "1em";
          document.getElementById(clone_name).style.fontSize = "1.3em";
          document.getElementById(clone_name).style.fontWeight = "bold";
          document.getElementById(clone_name).style.borderRadius = "1em";
          document.getElementById(clone_name).style.padding = "1em";
          document.getElementById(clone_name).style.width = "40em";
        }
      }
      console.log(post_data);
    },
  });
}

generate_posts();
