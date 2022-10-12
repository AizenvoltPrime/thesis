let user_choice = "none";
let user_chevron_vote = [];
let user_yes_no_vote = [];
let node = [];
let clone = [];
let post_data = [];
let ctx = [];
let myChart = [];

Chart.defaults.font.size = 20;

//This is for button animation.
(function () {
  var c = document.getElementById("sum");
  var d = document.getElementById("username-change");
  var e = document.getElementById("password-change");
  function addAnim() {
    c.classList.add("animated");
    c.removeEventListener("mouseover", addAnim);
    d.classList.add("animated");
    d.removeEventListener("mouseover", addAnim);
    e.classList.add("animated");
    e.removeEventListener("mouseover", addAnim);
  }

  // listen to mouseover for the container
  c.addEventListener("mouseover", addAnim);
  d.addEventListener("mouseover", addAnim);
  e.addEventListener("mouseover", addAnim);
})();

//This is for when the user clicks the "Plus" icon.
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
        if (post_data[0] !== undefined) {
          $("#add-post-icon").fadeOut(300, function () {});
          $("#all-filters").fadeOut(300, function () {});
          if (window.getComputedStyle(document.getElementById("username-change-form")).display !== "none") {
            $("#username-change-form").fadeOut(300, function () {});
          }
          if (window.getComputedStyle(document.getElementById("password-change-form")).display !== "none") {
            $("#password-change-form").fadeOut(300, function () {});
          }
          $(".post").fadeOut(300, function () {});
          $(".post")
            .promise()
            .done(function () {
              $(".post").not(":first").remove();
              reset_poll_data();
              document.getElementById("poll-selection").style.display = "flex";
              document.getElementById("poll-selection").style.animation = "fade_in_show 0.5s";
              document.getElementById("poll-question").style.display = "flex";
              document.getElementById("poll-question").style.animation = "fade_in_show 0.5s";
              $("#sum").fadeIn(300, function () {});
            });
        } else {
          $("#add-post-icon").fadeOut(300, function () {});
          $("#all-filters").fadeOut(300, function () {});
          $("#all-filters")
            .promise()
            .done(function () {
              reset_poll_data();
              document.getElementById("poll-selection").style.display = "flex";
              document.getElementById("poll-selection").style.animation = "fade_in_show 0.5s";
              document.getElementById("poll-question").style.display = "flex";
              document.getElementById("poll-question").style.animation = "fade_in_show 0.5s";
              $("#sum").fadeIn(300, function () {});
            });
        }
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

//This is for when the user submits the poll information from the template.
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
        $("#poll-question").fadeOut(300, function () {});
        $("#sum").fadeOut(300, function () {
          $("#all-filters").fadeIn(300, function () {});
          $("#add-post-icon").fadeIn(300, function () {});
          generate_posts(false);
          choice_dehighlight(user_choice);
          user_choice = "none";
          document.forms["poll-question"]["question-text"].value = "";
        });
      });
  }
});

//This generates the posts on the home page.
function generate_posts(bookmark_filter) {
  fetch("process_data.php", {
    method: "POST",
    body: JSON.stringify({ request: "get_post_data", bookmarks_only: bookmark_filter }),
  })
    .then((res) => res.json())
    .then((response) => {
      post_data.length = 0;
      user_chevron_vote.length = 0;
      user_yes_no_vote.length = 0;
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
          document.getElementById("post-user-name").innerText = post_data[i][1];
          document.getElementsByClassName("post-question")[0].innerText = post_data[i][4];
          document.getElementsByClassName("score")[0].innerText = post_data[i][5];
          document.getElementById("post-time").innerText = post_time;
          document.getElementById("post-time-detailed").innerText = post_data[i][6];
        } else if (i > 0) {
          node[i - 1] = document.getElementsByClassName("post")[0];
          clone[i - 1] = node[i - 1].cloneNode(true);
          clone[i - 1].querySelector("#post-user-name").innerText = post_data[i][1];
          clone[i - 1].querySelectorAll(".post-question")[0].innerText = post_data[i][4];
          clone[i - 1].querySelectorAll(".score")[0].innerText = post_data[i][5];
          clone[i - 1].querySelector("#post-time").innerText = post_time;
          clone[i - 1].querySelector("#post-time-detailed").innerText = post_data[i][6];
          document.getElementById("posts-container").appendChild(clone[i - 1]);
        }
      }
      if (post_time !== undefined && post_time !== null) {
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
            if (post_data[i][10] == 1) {
              let new_bookmark = document.createElement("i");
              new_bookmark.className = "fa-solid fa-bookmark";
              document.getElementsByClassName("parent_of_bookmark")[i].appendChild(new_bookmark);
              document.getElementsByClassName("parent_of_bookmark")[i].children[0].style.color = "#ff9c08";
            } else if (post_data[i][10] == 0) {
              let new_bookmark = document.createElement("i");
              new_bookmark.className = "fa-regular fa-bookmark";
              document.getElementsByClassName("parent_of_bookmark")[i].appendChild(new_bookmark);
            }
            let new_canvas = document.createElement("canvas");
            new_canvas.className = "myChart";
            document.getElementsByClassName("chartCard")[i].appendChild(new_canvas);
          }
        } else if (post_data[0].length <= 7) {
          for (let i = 0; i < post_data.length; i++) {
            let new_bookmark = document.createElement("i");
            new_bookmark.className = "fa-regular fa-bookmark";
            document.getElementsByClassName("parent_of_bookmark")[i].appendChild(new_bookmark);
            let new_canvas = document.createElement("canvas");
            new_canvas.className = "myChart";
            document.getElementsByClassName("chartCard")[i].appendChild(new_canvas);
          }
        }
        if (bookmark_filter == true || bookmark_filter == false) {
          $("#add-post-icon").fadeIn(300, function () {});
          $("#all-filters").fadeIn(300, function () {});
          $(".post").fadeIn(300, function () {});
        }
      } else {
        $("#add-post-icon").fadeIn(300, function () {});
        $("#all-filters").fadeIn(300, function () {});
      }
      console.log(post_data);
    });
}

generate_posts(false);

const postContainer = document.querySelector("#posts-container");

//This determines which post the user clicked to change its data.
postContainer.addEventListener(
  "click",
  (e) => {
    const btn_up = e.target.closest('button[data-dir="up"]');
    const btn_down = e.target.closest('button[data-dir="down"]');
    const btn_yes = e.target.closest('button[data-dir="yes"]');
    const btn_no = e.target.closest('button[data-dir="no"]');
    const btn_show_graph = e.target.closest('button[data-dir="show-graph"]');
    const btn_bookmark = e.target.closest('button[data-dir="bookmark"]');

    if (btn_show_graph) {
      const post_show_graph = btn_show_graph.closest(".post");
      const postIndexShowGraph = [...postContainer.children].indexOf(post_show_graph);

      if (window.getComputedStyle(document.getElementsByClassName("myChart")[postIndexShowGraph]).display === "block") {
        document.querySelectorAll(".show-graph")[postIndexShowGraph].style.backgroundColor = "#00a1ff80";
        document.querySelectorAll(".chartCard")[postIndexShowGraph].style.display = "none";
        if (myChart[postIndexShowGraph]) {
          myChart[postIndexShowGraph].destroy();
        }
      } else {
        document.querySelectorAll(".show-graph")[postIndexShowGraph].style.backgroundColor = "#00a1ff";
        get_yes_no_data(postIndexShowGraph);
      }
    }
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
                  document.querySelectorAll(".post")[postIndexUP].querySelectorAll(".score")[0].innerText = post_data[postIndexUP][5];
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
                  document.querySelectorAll(".post")[postIndexUP].querySelectorAll(".score")[0].innerText = post_data[postIndexUP][5];
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
                  document.querySelectorAll(".post")[postIndexUP].querySelectorAll(".score")[0].innerText = post_data[postIndexUP][5];
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
                  document.querySelectorAll(".post")[postIndexDown].querySelectorAll(".score")[0].innerText = post_data[postIndexDown][5];
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
                  document.querySelectorAll(".post")[postIndexDown].querySelectorAll(".score")[0].innerText = post_data[postIndexDown][5];
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
                  document.querySelectorAll(".post")[postIndexDown].querySelectorAll(".score")[0].innerText = post_data[postIndexDown][5];
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
                document.querySelectorAll(".post")[postIndexYes].querySelectorAll(".answer-yes")[0].style.background = "#007e7e";
                user_yes_no_vote[postIndexYes][0] = false;
              }
              if (window.getComputedStyle(document.getElementsByClassName("myChart")[postIndexYes]).display === "block") {
                get_yes_no_data(postIndexYes);
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
                document.querySelectorAll(".post")[postIndexYes].querySelectorAll(".answer-no")[0].style.background = "#007e7e";
                user_yes_no_vote[postIndexYes][0] = true;
                user_yes_no_vote[postIndexYes][1] = false;
              }
              if (window.getComputedStyle(document.getElementsByClassName("myChart")[postIndexYes]).display === "block") {
                get_yes_no_data(postIndexYes);
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
              if (window.getComputedStyle(document.getElementsByClassName("myChart")[postIndexYes]).display === "block") {
                get_yes_no_data(postIndexYes);
              }
            });
        }
      } else if (btn_no) {
        const post_no = btn_no.closest(".post");
        const postIndexNo = [...postContainer.children].indexOf(post_no);

        if (user_yes_no_vote[postIndexNo][0] == false && user_yes_no_vote[postIndexNo][1] == true) {
          fetch("process_data.php", {
            method: "POST",
            body: JSON.stringify({ request: "yes_no_vote", current_vote: "no", previous_vote: "no", post_id: post_data[postIndexNo][0] }),
          })
            .then((res) => res.text())
            .then((response) => {
              if (response.trim() == "Success") {
                document.querySelectorAll(".post")[postIndexNo].querySelectorAll(".answer-no")[0].style.background = "#007e7e";
                user_yes_no_vote[postIndexNo][1] = false;
              }
              if (window.getComputedStyle(document.getElementsByClassName("myChart")[postIndexNo]).display === "block") {
                get_yes_no_data(postIndexNo);
              }
            });
        } else if (user_yes_no_vote[postIndexNo][0] == true && user_yes_no_vote[postIndexNo][1] == false) {
          fetch("process_data.php", {
            method: "POST",
            body: JSON.stringify({ request: "yes_no_vote", current_vote: "no", previous_vote: "yes", post_id: post_data[postIndexNo][0] }),
          })
            .then((res) => res.text())
            .then((response) => {
              if (response.trim() == "Success") {
                document.querySelectorAll(".post")[postIndexNo].querySelectorAll(".answer-yes")[0].style.background = "#007e7e";
                document.querySelectorAll(".post")[postIndexNo].querySelectorAll(".answer-no")[0].style.background = "#cc0000";
                user_yes_no_vote[postIndexNo][0] = false;
                user_yes_no_vote[postIndexNo][1] = true;
              }
              if (window.getComputedStyle(document.getElementsByClassName("myChart")[postIndexNo]).display === "block") {
                get_yes_no_data(postIndexNo);
              }
            });
        } else if (user_yes_no_vote[postIndexNo][0] == false && user_yes_no_vote[postIndexNo][1] == false) {
          fetch("process_data.php", {
            method: "POST",
            body: JSON.stringify({ request: "yes_no_vote", current_vote: "no", previous_vote: "nothing", post_id: post_data[postIndexNo][0] }),
          })
            .then((res) => res.text())
            .then((response) => {
              if (response.trim() == "Success") {
                document.querySelectorAll(".post")[postIndexNo].querySelectorAll(".answer-no")[0].style.background = "#cc0000";
                user_yes_no_vote[postIndexNo][1] = true;
              }
              if (window.getComputedStyle(document.getElementsByClassName("myChart")[postIndexNo]).display === "block") {
                get_yes_no_data(postIndexNo);
              }
            });
        }
      } else if (btn_bookmark) {
        const post_bookmark = btn_bookmark.closest(".post");
        const postIndexBookmark = [...postContainer.children].indexOf(post_bookmark);

        if (post_data[postIndexBookmark][10] == 1) {
          fetch("process_data.php", {
            method: "POST",
            body: JSON.stringify({
              request: "bookmark",
              current_state: "checked",
              previous_state: "checked",
              post_id: post_data[postIndexBookmark][0],
            }),
          })
            .then((res) => res.text())
            .then((response) => {
              if (response.trim() == "Success") {
                document.getElementsByClassName("parent_of_bookmark")[postIndexBookmark].children[0].className = "fa-regular fa-bookmark";
                document.getElementsByClassName("parent_of_bookmark")[postIndexBookmark].children[0].style.color = null;
                post_data[postIndexBookmark][10] = 0;
              }
            });
        } else if (post_data[postIndexBookmark][10] == 0) {
          fetch("process_data.php", {
            method: "POST",
            body: JSON.stringify({
              request: "bookmark",
              current_state: "checked",
              previous_state: "not_checked",
              post_id: post_data[postIndexBookmark][0],
            }),
          })
            .then((res) => res.text())
            .then((response) => {
              if (response.trim() == "Success") {
                document.getElementsByClassName("parent_of_bookmark")[postIndexBookmark].children[0].className = "fa-solid fa-bookmark";
                document.getElementsByClassName("parent_of_bookmark")[postIndexBookmark].children[0].style.color = "#ff9c08";
                post_data[postIndexBookmark][10] = 1;
              }
            });
        }
      } else {
        return;
      }
    } else {
      return;
    }
  },
  { passive: true }
);

//This is for when the user clicks "Bookmarks" on the user navabar.
document.getElementsByClassName("nav-element")[3].addEventListener("click", function () {
  if (window.getComputedStyle(document.getElementById("all-filters")).display === "none") {
    $("#warning-nothing-selected").fadeOut(300, function () {});
    $("#warning-empty-text-area").fadeOut(300, function () {});
    $("#poll-selection").fadeOut(300, function () {});
    $("#poll-question").fadeOut(300, function () {});
    if (window.getComputedStyle(document.getElementById("username-change-form")).display !== "none") {
      $("#username-change-form").fadeOut(300, function () {});
    }
    if (window.getComputedStyle(document.getElementById("password-change-form")).display !== "none") {
      $("#password-change-form").fadeOut(300, function () {});
    }
    $("#sum").fadeOut(300, function () {
      $("#all-filters").fadeIn(300, function () {});
      $("#add-post-icon").fadeIn(300, function () {});
      document.getElementById("user-nav").style.width = "0";
      document.getElementById("profile-icon").style.visibility = "visible";
      generate_posts(true);
      if (user_choice !== "none") {
        choice_dehighlight(user_choice);
        user_choice = "none";
      }
      document.forms["poll-question"]["question-text"].value = "";
    });
  } else {
    $("#add-post-icon").fadeOut(300, function () {});
    $("#all-filters").fadeOut(300, function () {});
    if (window.getComputedStyle(document.getElementById("username-change-form")).display !== "none") {
      $("#username-change-form").fadeOut(300, function () {});
    }
    if (window.getComputedStyle(document.getElementById("password-change-form")).display !== "none") {
      $("#password-change-form").fadeOut(300, function () {});
    }
    $(".post").fadeOut(300, function () {});
    $(".post")
      .promise()
      .done(function () {
        $(".post").fadeOut(300, function () {});
        $(".post").not(":first").remove();
        reset_poll_data();
        document.getElementById("user-nav").style.width = "0";
        document.getElementById("profile-icon").style.visibility = "visible";
        generate_posts(true);
      });
  }
});

//This is for when the user clicks "Home" on the left navbar.
document.getElementsByClassName("nav-element")[0].addEventListener("click", function () {
  if (window.getComputedStyle(document.getElementById("all-filters")).display === "none") {
    $("#warning-nothing-selected").fadeOut(300, function () {});
    $("#warning-empty-text-area").fadeOut(300, function () {});
    $("#poll-selection").fadeOut(300, function () {});
    $("#poll-question").fadeOut(300, function () {});
    if (window.getComputedStyle(document.getElementById("username-change-form")).display !== "none") {
      $("#username-change-form").fadeOut(300, function () {});
    }
    if (window.getComputedStyle(document.getElementById("password-change-form")).display !== "none") {
      $("#password-change-form").fadeOut(300, function () {});
    }
    $("#sum").fadeOut(300, function () {
      $("#all-filters").fadeIn(300, function () {});
      $("#add-post-icon").fadeIn(300, function () {});
      document.getElementById("sidenav").style.width = "0";
      document.getElementById("sidenav-icon").style.visibility = "visible";
      generate_posts(false);
      if (user_choice !== "none") {
        choice_dehighlight(user_choice);
        user_choice = "none";
      }
      document.forms["poll-question"]["question-text"].value = "";
    });
  } else {
    $("#add-post-icon").fadeOut(300, function () {});
    $("#all-filters").fadeOut(300, function () {});
    if (window.getComputedStyle(document.getElementById("username-change-form")).display !== "none") {
      $("#username-change-form").fadeOut(300, function () {});
    }
    if (window.getComputedStyle(document.getElementById("password-change-form")).display !== "none") {
      $("#password-change-form").fadeOut(300, function () {});
    }
    $(".post").fadeOut(300, function () {});
    $(".post")
      .promise()
      .done(function () {
        $(".post").not(":first").remove();
        reset_poll_data();
        document.getElementById("sidenav").style.width = "0";
        document.getElementById("sidenav-icon").style.visibility = "visible";
        generate_posts(false);
      });
  }
});

//This is for when the user clicks "Change Username" on the user navbar.
document.getElementsByClassName("nav-element")[4].addEventListener("click", function () {
  if (window.getComputedStyle(document.getElementById("all-filters")).display === "none") {
    $("#warning-nothing-selected").fadeOut(300, function () {});
    $("#warning-empty-text-area").fadeOut(300, function () {});
    $("#poll-selection").fadeOut(300, function () {});
    $("#poll-question").fadeOut(300, function () {});
    if (window.getComputedStyle(document.getElementById("password-change-form")).display !== "none") {
      $("#password-change-form").fadeOut(300, function () {});
    }
    $("#sum").fadeOut(300, function () {
      document.getElementById("user-nav").style.width = "0";
      document.getElementById("profile-icon").style.visibility = "visible";
      $("#username-change-form").fadeIn(300, function () {});
      if (user_choice !== "none") {
        choice_dehighlight(user_choice);
        user_choice = "none";
      }
      document.forms["poll-question"]["question-text"].value = "";
    });
  } else {
    $("#add-post-icon").fadeOut(300, function () {});
    $("#all-filters").fadeOut(300, function () {});
    $(".post").fadeOut(300, function () {});
    $(".post")
      .promise()
      .done(function () {
        $(".post").fadeOut(300, function () {});
        $(".post").not(":first").remove();
        reset_poll_data();
        document.getElementById("user-nav").style.width = "0";
        document.getElementById("profile-icon").style.visibility = "visible";
        $("#username-change-form").fadeIn(300, function () {});
      });
  }
});

//This is for when the user submits the form data to change Username.
document.getElementById("username-change").addEventListener("click", function () {
  let new_username = document.forms["username-change-form"]["username"].value;
  let upass = document.forms["username-change-form"]["password"].value;

  if (new_username === "") {
    document.getElementById("user-help").innerText = "Username must be filled!";
    document.getElementById("pass-help").innerText = "";
  } else if (new_username.length < 6 || new_username.length > 16) {
    document.getElementById("user-help").innerText = "Username must be between 6 and 16 characters!";
    document.getElementById("pass-help").innerText = "";
  } else if (new_username.indexOf(" ") > 0) {
    document.getElementById("user-help").innerText = "Username must not have spaces!";
    document.getElementById("pass-help").innerText = "";
  } else if (upass === "") {
    document.getElementById("user-help").innerText = "";
    document.getElementById("pass-help").innerText = "Password must be filled!";
  } else {
    document.getElementById("user-help").innerText = "";
    document.getElementById("pass-help").innerText = "";
    fetch("process_data.php", {
      method: "POST",
      body: JSON.stringify({ request: "username_change", username: new_username, password: upass }),
    })
      .then((res) => res.text())
      .then((response) => {
        if (response.trim() == "Username Unavailable!") {
          document.getElementById("user-help").innerText = "Username Unavailable!";
          document.getElementById("pass-help").innerText = "";
        } else if (response.trim() == "Incorrect Password!") {
          document.getElementById("user-help").innerText = "";
          document.getElementById("pass-help").innerText = "Incorrect Password!";
        } else if (response.trim() == "Success") {
          document.getElementById("user-help").innerText = "";
          document.getElementById("pass-help").innerText = "";
          $("#username-change-form").fadeOut(300, function () {});
          $("#username-change-form")
            .promise()
            .done(function () {
              document.getElementsByClassName("logged-form-control")[0].value = "";
              document.getElementsByClassName("logged-form-control")[1].value = "";
              $("#all-filters").fadeIn(300, function () {});
              $("#add-post-icon").fadeIn(300, function () {});
              generate_posts(false);
            });
        }
      });
  }
});

//This is for when the user clicks "Change Password" on the user navbar.
document.getElementsByClassName("nav-element")[5].addEventListener("click", function () {
  if (window.getComputedStyle(document.getElementById("all-filters")).display === "none") {
    $("#warning-nothing-selected").fadeOut(300, function () {});
    $("#warning-empty-text-area").fadeOut(300, function () {});
    $("#poll-selection").fadeOut(300, function () {});
    $("#poll-question").fadeOut(300, function () {});
    if (window.getComputedStyle(document.getElementById("username-change-form")).display !== "none") {
      $("#username-change-form").fadeOut(300, function () {});
    }
    $("#sum").fadeOut(300, function () {
      document.getElementById("user-nav").style.width = "0";
      document.getElementById("profile-icon").style.visibility = "visible";
      $("#password-change-form").fadeIn(300, function () {});
      if (user_choice !== "none") {
        choice_dehighlight(user_choice);
        user_choice = "none";
      }
      document.forms["poll-question"]["question-text"].value = "";
    });
  } else {
    $("#add-post-icon").fadeOut(300, function () {});
    $("#all-filters").fadeOut(300, function () {});
    $(".post").fadeOut(300, function () {});
    $(".post")
      .promise()
      .done(function () {
        $(".post").fadeOut(300, function () {});
        $(".post").not(":first").remove();
        reset_poll_data();
        document.getElementById("user-nav").style.width = "0";
        document.getElementById("profile-icon").style.visibility = "visible";
        $("#password-change-form").fadeIn(300, function () {});
      });
  }
});

//This is for when the user submits the form data to change Password.
document.getElementById("password-change").addEventListener("click", function () {
  let current_password = document.forms["password-change-form"]["current-password"].value;
  let new_pass = document.forms["password-change-form"]["new-password"].value;
  let conf_pass = document.forms["password-change-form"]["repeat-new-password"].value;

  if (new_pass === "" || conf_pass === "" || current_password === "") {
    document.getElementById("password-help").innerText = "One of the password fields is empty!";
    document.getElementById("passc-help").innerText = "";
  } else if (new_pass !== conf_pass) {
    document.getElementById("password-help").innerText = "";
    document.getElementById("passc-help").innerText = "Passwords must match!";
  } else if (new_pass.length < 8) {
    document.getElementById("password-help").innerText = "";
    document.getElementById("passc-help").innerText = "Password must be at least 8 characters!";
  } else if (new_pass.indexOf(" ") > 0) {
    document.getElementById("password-help").innerText = "";
    document.getElementById("passc-help").innerText = "Password must not have spaces!";
  } else if (!/[A-Z]/g.test(new_pass) || !/[0-9]/g.test(new_pass) || !/[.!@#$&*]/g.test(new_pass)) {
    document.getElementById("password-help").innerText = "";
    document.getElementById("passc-help").innerText =
      "Password must contain at least 8 character and must also contain, at least one capital letter, a digit and one of these symbols (e.g. .!#$*&@)!";
  } else {
    fetch("process_data.php", {
      method: "POST",
      body: JSON.stringify({
        request: "password_change",
        current_password: current_password,
        new_password: new_pass,
      }),
    })
      .then((res) => res.text())
      .then((response) => {
        if (response.trim() == "Incorrect Password!") {
          document.getElementById("password-help").innerText = "Incorrect Password!";
          document.getElementById("passc-help").innerText = "";
        } else if (response.trim() == "Success") {
          document.getElementById("password-help").innerText = "";
          document.getElementById("passc-help").innerText = "";
          $("#password-change-form").fadeOut(300, function () {});
          $("#password-change-form")
            .promise()
            .done(function () {
              document.getElementsByClassName("logged-form-control")[2].value = "";
              document.getElementsByClassName("logged-form-control")[3].value = "";
              document.getElementsByClassName("logged-form-control")[4].value = "";
              $("#all-filters").fadeIn(300, function () {});
              $("#add-post-icon").fadeIn(300, function () {});
              generate_posts(false);
            });
        }
      });
  }
});

function get_yes_no_data(post_number) {
  fetch("process_data.php", {
    method: "POST",
    body: JSON.stringify({ request: "yes_no_data", post_id: post_data[post_number][0] }),
  })
    .then((res) => res.json())
    .then((response) => {
      if (myChart[post_number]) {
        myChart[post_number].destroy();
      }
      document.querySelectorAll(".chartCard")[post_number].style.display = "block";
      ctx[post_number] = document.getElementsByClassName("myChart")[post_number].getContext("2d");
      myChart[post_number] = new Chart(ctx[post_number], {
        type: "bar",
        data: {
          labels: ["Yes", "No"],
          datasets: [
            {
              label: "Yes/No Poll",
              data: [parseInt(response[0]), parseInt(response[1])],
              backgroundColor: [],
              borderColor: ["#00ffffbb", "#cc0000"],
              borderWidth: 1,
              hoverBackgroundColor: ["#00ffffbb", "#cc0000"],
            },
          ],
        },
        options: {
          maintainAspectRatio: false,
          hover: { mode: null },
          plugins: {
            legend: {
              labels: {
                color: "#f3f3f3",
                boxWidth: 0,
                fontSize: 2,
              },
            },
          },
          scales: {
            y: {
              ticks: {
                color: "#f3f3f3",
              },
            },
            x: {
              ticks: {
                color: "#f3f3f3",
              },
            },
          },
        },
      });
    });
}

function reset_poll_data() {
  document.querySelectorAll(".fa-chevron-up").forEach((icon) => (icon.style.color = null));
  document.querySelectorAll(".fa-chevron-down").forEach((icon) => (icon.style.color = null));
  document.querySelectorAll(".answer-yes").forEach((icon) => (icon.style.background = null));
  document.querySelectorAll(".answer-no").forEach((icon) => (icon.style.background = null));
  document.querySelectorAll(".show-graph").forEach((icon) => (icon.style.background = null));
  document.querySelectorAll(".parent_of_bookmark").forEach((main_class) => (main_class.innerHTML = ""));
  document.querySelectorAll(".chartCard").forEach((main_class) => ((main_class.innerHTML = ""), (main_class.style.display = "none")));
}
