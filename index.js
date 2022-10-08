"use strict";

let user_choice = "none";
let user_chevron_vote = [];
let user_yes_no_vote = [];
let node = [];
let clone = [];
let post_data = [];

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
        document.querySelectorAll(".fa-chevron-up").forEach((icon) => (icon.style.color = null));
        document.querySelectorAll(".fa-chevron-down").forEach((icon) => (icon.style.color = null));
        document.querySelectorAll(".answer-yes").forEach((icon) => (icon.style.background = null));
        document.querySelectorAll(".answer-no").forEach((icon) => (icon.style.background = null));
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
    $("#warning-nothing-selected").fadeOut(300, function () {});
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

function generate_posts() {
  fetch("process_data.php", {
    method: "POST",
    body: JSON.stringify({ request: "get_post_data" }),
  })
    .then((res) => res.json())
    .then((response) => {
      post_data.length = 0;
      user_chevron_vote.length = 0;
      post_data = response;
      let post_time;
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
          document.getElementById("post-user-name").innerHTML = post_data[i][1];
          document.getElementsByClassName("post-question")[0].innerHTML = post_data[i][4];
          document.getElementsByClassName("score")[0].innerHTML = post_data[i][5];
          document.getElementById("post-time").innerHTML = post_time;
          document.getElementById("post-time-detailed").innerHTML = post_data[i][6];
        } else if (i > 0) {
          node[i - 1] = document.getElementsByClassName("post")[0];
          clone[i - 1] = node[i - 1].cloneNode(true);
          clone[i - 1].querySelector("#post-user-name").innerHTML = post_data[i][1];
          clone[i - 1].querySelectorAll(".post-question")[0].innerHTML = post_data[i][4];
          clone[i - 1].querySelectorAll(".score")[0].innerHTML = post_data[i][5];
          clone[i - 1].querySelector("#post-time").innerHTML = post_time;
          clone[i - 1].querySelector("#post-time-detailed").innerHTML = post_data[i][6];
          document.getElementById("posts-container").appendChild(clone[i - 1]);
        }
      }
      if (post_data[0].length > 7) {
        for (let i = 0; i < post_data.length; i++) {
          if (post_data[i][7] == 1) {
            document.getElementsByClassName("fa-chevron-up")[i].style.color = "#00ffd0";
            user_chevron_vote.push([true, false]);
          } else if (post_data[i][7] == -1) {
            document.getElementsByClassName("fa-chevron-down")[i].style.color = "#cc0000";
            user_chevron_vote.push([false, true]);
          } else if (post_data[i][7] != 1 && post_data[i][7] != -1) {
            user_chevron_vote.push([false, false]);
          }
          if (post_data[i][8] == 1) {
            document.getElementsByClassName("answer-yes")[i].style.background = "#00ffd0";
            user_yes_no_vote.push([true, false]);
          } else if (post_data[i][9] == 1) {
            document.getElementsByClassName("answer-no")[i].style.background = "#cc0000";
            user_yes_no_vote.push([false, true]);
          } else if (post_data[i][8] == 0 && post_data[i][9] == 0) {
            user_yes_no_vote.push([false, false]);
          }
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
    const btn_up = e.target.closest('button[data-dir="up"]');
    const btn_down = e.target.closest('button[data-dir="down"]');
    const btn_yes = e.target.closest('button[data-dir="yes"]');
    const btn_no = e.target.closest('button[data-dir="no"]');
    const btn_show_graph = e.target.closest('button[data-dir="show-graph"]');
    if (post_data[0].length > 7) {
      if (btn_up) {
        const post_up = btn_up.closest(".post");
        const postIndexUP = [...postContainer.children].indexOf(post_up);

        if (user_chevron_vote[postIndexUP][0] == true && user_chevron_vote[postIndexUP][1] == false) {
          fetch("process_data.php", {
            method: "POST",
            body: JSON.stringify({ request: "chevron_vote", direction: "up", previous_vote: "up", post_id: post_data[postIndexUP][0] }),
          })
            .then((res) => res.text())
            .then((response) => {
              if (response.trim() == "Success") {
                post_data[postIndexUP][5] = parseInt(post_data[postIndexUP][5]) - 1;
                document.querySelectorAll(".post")[postIndexUP].querySelectorAll(".fa-chevron-up")[0].style.color = null;
                $(document.querySelectorAll(".post")[postIndexUP].querySelectorAll(".score")[0]).fadeOut(300, function () {
                  document.querySelectorAll(".post")[postIndexUP].querySelectorAll(".score")[0].innerHTML = post_data[postIndexUP][5];
                  $(document.querySelectorAll(".post")[postIndexUP].querySelectorAll(".score")[0]).fadeIn(300, function () {});
                });
                user_chevron_vote[postIndexUP][0] = false;
              }
            });
        } else if (user_chevron_vote[postIndexUP][0] == false && user_chevron_vote[postIndexUP][1] == true) {
          fetch("process_data.php", {
            method: "POST",
            body: JSON.stringify({ request: "chevron_vote", direction: "up", previous_vote: "down", post_id: post_data[postIndexUP][0] }),
          })
            .then((res) => res.text())
            .then((response) => {
              if (response.trim() == "Success") {
                post_data[postIndexUP][5] = parseInt(post_data[postIndexUP][5]) + 2;
                document.querySelectorAll(".post")[postIndexUP].querySelectorAll(".fa-chevron-up")[0].style.color = "#00ffd0";
                document.querySelectorAll(".post")[postIndexUP].querySelectorAll(".fa-chevron-down")[0].style.color = null;
                $(document.querySelectorAll(".post")[postIndexUP].querySelectorAll(".score")[0]).fadeOut(300, function () {
                  document.querySelectorAll(".post")[postIndexUP].querySelectorAll(".score")[0].innerHTML = post_data[postIndexUP][5];
                  $(document.querySelectorAll(".post")[postIndexUP].querySelectorAll(".score")[0]).fadeIn(300, function () {});
                });
                user_chevron_vote[postIndexUP][0] = true;
                user_chevron_vote[postIndexUP][1] = false;
              }
            });
        } else if (user_chevron_vote[postIndexUP][0] == false && user_chevron_vote[postIndexUP][1] == false) {
          fetch("process_data.php", {
            method: "POST",
            body: JSON.stringify({ request: "chevron_vote", direction: "up", previous_vote: "no", post_id: post_data[postIndexUP][0] }),
          })
            .then((res) => res.text())
            .then((response) => {
              if (response.trim() == "Success") {
                post_data[postIndexUP][5] = parseInt(post_data[postIndexUP][5]) + 1;
                document.querySelectorAll(".post")[postIndexUP].querySelectorAll(".fa-chevron-up")[0].style.color = "#00ffd0";
                $(document.querySelectorAll(".post")[postIndexUP].querySelectorAll(".score")[0]).fadeOut(300, function () {
                  document.querySelectorAll(".post")[postIndexUP].querySelectorAll(".score")[0].innerHTML = post_data[postIndexUP][5];
                  $(document.querySelectorAll(".post")[postIndexUP].querySelectorAll(".score")[0]).fadeIn(300, function () {});
                });
                user_chevron_vote[postIndexUP][0] = true;
              }
            });
        }
      } else if (btn_down) {
        const post_down = btn_down.closest(".post");
        const postIndexDown = [...postContainer.children].indexOf(post_down);

        if (user_chevron_vote[postIndexDown][0] == false && user_chevron_vote[postIndexDown][1] == true) {
          fetch("process_data.php", {
            method: "POST",
            body: JSON.stringify({ request: "chevron_vote", direction: "down", previous_vote: "down", post_id: post_data[postIndexDown][0] }),
          })
            .then((res) => res.text())
            .then((response) => {
              if (response.trim() == "Success") {
                post_data[postIndexDown][5] = parseInt(post_data[postIndexDown][5]) + 1;
                document.querySelectorAll(".post")[postIndexDown].querySelectorAll(".fa-chevron-down")[0].style.color = null;
                $(document.querySelectorAll(".post")[postIndexDown].querySelectorAll(".score")[0]).fadeOut(300, function () {
                  document.querySelectorAll(".post")[postIndexDown].querySelectorAll(".score")[0].innerHTML = post_data[postIndexDown][5];
                  $(document.querySelectorAll(".post")[postIndexDown].querySelectorAll(".score")[0]).fadeIn(300, function () {});
                });
                user_chevron_vote[postIndexDown][1] = false;
              }
            });
        } else if (user_chevron_vote[postIndexDown][0] == true && user_chevron_vote[postIndexDown][1] == false) {
          fetch("process_data.php", {
            method: "POST",
            body: JSON.stringify({ request: "chevron_vote", direction: "down", previous_vote: "up", post_id: post_data[postIndexDown][0] }),
          })
            .then((res) => res.text())
            .then((response) => {
              if (response.trim() == "Success") {
                post_data[postIndexDown][5] = parseInt(post_data[postIndexDown][5]) - 2;
                document.querySelectorAll(".post")[postIndexDown].querySelectorAll(".fa-chevron-up")[0].style.color = null;
                document.querySelectorAll(".post")[postIndexDown].querySelectorAll(".fa-chevron-down")[0].style.color = "#cc0000";
                $(document.querySelectorAll(".post")[postIndexDown].querySelectorAll(".score")[0]).fadeOut(300, function () {
                  document.querySelectorAll(".post")[postIndexDown].querySelectorAll(".score")[0].innerHTML = post_data[postIndexDown][5];
                  $(document.querySelectorAll(".post")[postIndexDown].querySelectorAll(".score")[0]).fadeIn(300, function () {});
                });
                user_chevron_vote[postIndexDown][0] = false;
                user_chevron_vote[postIndexDown][1] = true;
              }
            });
        } else if (user_chevron_vote[postIndexDown][0] == false && user_chevron_vote[postIndexDown][1] == false) {
          fetch("process_data.php", {
            method: "POST",
            body: JSON.stringify({ request: "chevron_vote", direction: "down", previous_vote: "no", post_id: post_data[postIndexDown][0] }),
          })
            .then((res) => res.text())
            .then((response) => {
              if (response.trim() == "Success") {
                post_data[postIndexDown][5] = parseInt(post_data[postIndexDown][5]) - 1;
                document.querySelectorAll(".post")[postIndexDown].querySelectorAll(".fa-chevron-down")[0].style.color = "#cc0000";
                $(document.querySelectorAll(".post")[postIndexDown].querySelectorAll(".score")[0]).fadeOut(300, function () {
                  document.querySelectorAll(".post")[postIndexDown].querySelectorAll(".score")[0].innerHTML = post_data[postIndexDown][5];
                  $(document.querySelectorAll(".post")[postIndexDown].querySelectorAll(".score")[0]).fadeIn(300, function () {});
                });
                user_chevron_vote[postIndexDown][1] = true;
              }
            });
        }
      } else if (btn_yes) {
        const post_yes = btn_yes.closest(".post");
        const postIndexYes = [...postContainer.children].indexOf(post_yes);

        if (user_yes_no_vote[postIndexYes][0] == true && user_yes_no_vote[postIndexYes][1] == false) {
          fetch("process_data.php", {
            method: "POST",
            body: JSON.stringify({ request: "yes_no_vote", current_vote: "yes", previous_vote: "yes", post_id: post_data[postIndexYes][0] }),
          })
            .then((res) => res.text())
            .then((response) => {
              if (response.trim() == "Success") {
                document.querySelectorAll(".post")[postIndexYes].querySelectorAll(".answer-yes")[0].style.background = "#00ffffbb";
                user_yes_no_vote[postIndexYes][0] = false;
              }
            });
        } else if (user_yes_no_vote[postIndexYes][0] == false && user_yes_no_vote[postIndexYes][1] == true) {
          fetch("process_data.php", {
            method: "POST",
            body: JSON.stringify({ request: "yes_no_vote", current_vote: "yes", previous_vote: "no", post_id: post_data[postIndexYes][0] }),
          })
            .then((res) => res.text())
            .then((response) => {
              if (response.trim() == "Success") {
                document.querySelectorAll(".post")[postIndexYes].querySelectorAll(".answer-yes")[0].style.background = "#00ffd0";
                document.querySelectorAll(".post")[postIndexYes].querySelectorAll(".answer-no")[0].style.background = "#00ffffbb";
                user_yes_no_vote[postIndexYes][0] = true;
                user_yes_no_vote[postIndexYes][1] = false;
              }
            });
        } else if (user_yes_no_vote[postIndexYes][0] == false && user_yes_no_vote[postIndexYes][1] == false) {
          fetch("process_data.php", {
            method: "POST",
            body: JSON.stringify({ request: "yes_no_vote", current_vote: "yes", previous_vote: "nothing", post_id: post_data[postIndexYes][0] }),
          })
            .then((res) => res.text())
            .then((response) => {
              if (response.trim() == "Success") {
                document.querySelectorAll(".post")[postIndexYes].querySelectorAll(".answer-yes")[0].style.background = "#00ffd0";
                user_yes_no_vote[postIndexYes][0] = true;
              }
            });
        }
      } else if (btn_no) {
        const post_no = btn_no.closest(".post");
        const postIndexNo = [...postContainer.children].indexOf(post_no);
      } else if (btn_show_graph) {
        const post_show_graph = btn_show_graph.closest(".post");
        const postIndexShowGraph = [...postContainer.children].indexOf(post_show_graph);
      } else {
        return;
      }
    } else {
      return;
    }
  },
  { passive: true }
);
