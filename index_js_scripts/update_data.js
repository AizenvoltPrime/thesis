import {
  conn,
  add_new_post,
  get_variables,
  edit_chevron,
  make_yes_no_chart,
  edit_vote,
  edit_bookmark,
  generate_posts,
  reset_poll_data,
  null_all_styles,
} from "./index.js";
import { null_style, clear_filters } from "./filters.js";

var DateTime = luxon.DateTime;
let new_post_counter = 1;

export function clear_bell_counter() {
  document.getElementById("bell-inner-container").style.display = "none";
  new_post_counter = 1;
}

addEventListener("DOMContentLoaded", (event) => {
  conn.onmessage = function (e) {
    if (
      JSON.parse(e.data)[0] === "new_post_added" &&
      window.getComputedStyle(document.getElementsByClassName("fa-fire-flame-curved")[0]).backgroundClip !== "text" &&
      window.getComputedStyle(document.getElementsByClassName("fa-table-list")[0]).backgroundClip !== "text" &&
      (document.forms["search-box-container"]["search-text"].value === "" ||
        document.forms["search-box-container"]["search-text"].value === undefined) &&
      window.getComputedStyle(document.getElementsByClassName("fa-filter")[0]).backgroundClip !== "text"
    ) {
      let post_time_relative = DateTime.fromFormat(JSON.parse(e.data)[1][6], "yyyy-MM-dd HH:mm:ss").toRelative();
      let post_time_detailed = DateTime.fromFormat(JSON.parse(e.data)[1][6], "yyyy-MM-dd HH:mm:ss").toFormat("cccc, dd MMMM, yyyy, TTTT");
      let node = document.getElementsByClassName("post")[0];
      let clone = node.cloneNode(true);

      clone.querySelectorAll(".fa-chevron-up").forEach((icon) => (icon.style.color = null));
      clone.querySelectorAll(".fa-chevron-down").forEach((icon) => (icon.style.color = null));
      clone.querySelectorAll(".answer-yes").forEach((icon) => (icon.style.background = null));
      clone.querySelectorAll(".answer-no").forEach((icon) => (icon.style.background = null));
      clone.querySelectorAll(".show-graph").forEach((icon) => (icon.style.background = null));
      clone.querySelectorAll(".parent_of_bookmark").forEach((main_class) => (main_class.innerHTML = ""));
      clone.querySelectorAll(".parent_of_fa_check").forEach((main_class) => (main_class.innerHTML = ""));
      clone.querySelectorAll(".poll-timer-container").forEach((main_class) => (main_class.style.display = null));
      clone.querySelectorAll(".fa-clock").forEach((main_class) => (main_class.style.color = null));
      clone.querySelectorAll(".poll-remaining-time").forEach((main_class) => (main_class.innerText = ""));
      clone.querySelectorAll(".chartCard").forEach((main_class) => ((main_class.innerHTML = ""), (main_class.style.display = "none")));

      clone.querySelectorAll(".post-user-name")[0].innerText = JSON.parse(e.data)[1][1];
      clone.querySelectorAll(".post-question")[0].innerText = JSON.parse(e.data)[1][4];
      clone.querySelectorAll(".score")[0].innerText = JSON.parse(e.data)[1][5];
      clone.querySelectorAll(".post-time")[0].innerText = post_time_relative;
      clone.querySelectorAll(".post-time-detailed")[0].innerText = post_time_detailed;
      document.getElementById("posts-container").prepend(clone);

      let new_bookmark = document.createElement("i");
      new_bookmark.className = "fa-regular fa-bookmark";
      clone.getElementsByClassName("parent_of_bookmark")[0].appendChild(new_bookmark);
      let new_canvas = document.createElement("canvas");
      new_canvas.className = "myChart";
      clone.getElementsByClassName("chartCard")[0].appendChild(new_canvas);
      if (
        JSON.parse(e.data)[1][11] !== null &&
        DateTime.fromFormat(JSON.parse(e.data)[1][11], "yyyy-MM-dd HH:mm:ss").toRelative().search("ago") === -1
      ) {
        clone.querySelectorAll(".poll-remaining-time")[0].innerText =
          "Poll closes " + DateTime.fromFormat(JSON.parse(e.data)[1][11], "yyyy-MM-dd HH:mm:ss").toRelative();
        clone.querySelectorAll(".poll-timer-container")[0].style.display = "flex";
        clone.querySelectorAll(".fa-clock")[0].style.color = "#00ffd0";
      }

      if (JSON.parse(e.data)[1][15] == 0 && JSON.parse(e.data)[1][2] == 1) {
        let new_check = document.createElement("i");
        new_check.className = "fa-solid fa-check";
        clone.getElementsByClassName("parent_of_fa_check")[0].appendChild(new_check);
        clone.getElementsByClassName("parent_of_fa_check")[0].children[0].style.color = "#b5b5b5";
      }

      if (get_variables()[2] > 9) {
        add_new_post(JSON.parse(e.data)[1]);
      } else if (get_variables()[2] <= 9) {
        add_new_post([
          JSON.parse(e.data)[1][0],
          JSON.parse(e.data)[1][1],
          JSON.parse(e.data)[1][2],
          JSON.parse(e.data)[1][3],
          JSON.parse(e.data)[1][4],
          JSON.parse(e.data)[1][5],
          post_time_detailed,
          JSON.parse(e.data)[1][11],
          JSON.parse(e.data)[1][15],
        ]);
      }
    } else if (
      JSON.parse(e.data)[0] === "new_post_added" &&
      (window.getComputedStyle(document.getElementsByClassName("fa-fire-flame-curved")[0]).backgroundClip === "text" ||
        window.getComputedStyle(document.getElementsByClassName("fa-table-list")[0]).backgroundClip === "text" ||
        (document.forms["search-box-container"]["search-text"].value !== "" &&
          document.forms["search-box-container"]["search-text"].value !== undefined) ||
        window.getComputedStyle(document.getElementsByClassName("fa-filter")[0]).backgroundClip === "text")
    ) {
      $("#bell-notification-details").fadeOut(300, function () {
        document.getElementById("bell-inner-container").style.display = "block";
        document.getElementById("bell-inner-container").innerText = new_post_counter;
        new_post_counter++;
      });
    } else if (JSON.parse(e.data)[0] === "chevron_vote_up_up") {
      for (let i = 0; i < get_variables()[3].length; i++) {
        if (get_variables()[3][i][0] === JSON.parse(e.data)[1]) {
          let new_value = parseInt(get_variables()[3][i][5]) - 1;
          if (JSON.parse(e.data)[2] === get_variables()[3][0][16]) {
            document.getElementsByClassName("fa-chevron-up")[i].style.color = "#b5b5b5";
            edit_chevron(i, new_value, [false, false]);
          } else {
            edit_chevron(i, new_value, null);
          }
        }
      }
    } else if (JSON.parse(e.data)[0] === "chevron_vote_up_down") {
      for (let i = 0; i < get_variables()[3].length; i++) {
        if (get_variables()[3][i][0] === JSON.parse(e.data)[1]) {
          let new_value = parseInt(get_variables()[3][i][5]) + 2;
          if (JSON.parse(e.data)[2] === get_variables()[3][0][16]) {
            document.getElementsByClassName("fa-chevron-up")[i].style.color = "#00ffd0";
            document.getElementsByClassName("fa-chevron-down")[i].style.color = "#b5b5b5";
            edit_chevron(i, new_value, [true, false]);
          } else {
            edit_chevron(i, new_value, null);
          }
        }
      }
    } else if (JSON.parse(e.data)[0] === "chevron_vote_up_no") {
      for (let i = 0; i < get_variables()[3].length; i++) {
        if (get_variables()[3][i][0] === JSON.parse(e.data)[1]) {
          let new_value = parseInt(get_variables()[3][i][5]) + 1;
          if (JSON.parse(e.data)[2] === get_variables()[3][0][16]) {
            document.getElementsByClassName("fa-chevron-up")[i].style.color = "#00ffd0";
            edit_chevron(i, new_value, [true, false]);
          } else {
            edit_chevron(i, new_value, null);
          }
        }
      }
    } else if (JSON.parse(e.data)[0] === "chevron_vote_down_down") {
      for (let i = 0; i < get_variables()[3].length; i++) {
        if (get_variables()[3][i][0] === JSON.parse(e.data)[1]) {
          let new_value = parseInt(get_variables()[3][i][5]) + 1;
          if (JSON.parse(e.data)[2] === get_variables()[3][0][16]) {
            document.getElementsByClassName("fa-chevron-down")[i].style.color = "#b5b5b5";
            edit_chevron(i, new_value, [false, false]);
          } else {
            edit_chevron(i, new_value, null);
          }
        }
      }
    } else if (JSON.parse(e.data)[0] === "chevron_vote_down_up") {
      for (let i = 0; i < get_variables()[3].length; i++) {
        if (get_variables()[3][i][0] === JSON.parse(e.data)[1]) {
          let new_value = parseInt(get_variables()[3][i][5]) - 2;
          if (JSON.parse(e.data)[2] === get_variables()[3][0][16]) {
            document.getElementsByClassName("fa-chevron-up")[i].style.color = "#b5b5b5";
            document.getElementsByClassName("fa-chevron-down")[i].style.color = "#cc0000";
            edit_chevron(i, new_value, [false, true]);
          } else {
            edit_chevron(i, new_value, null);
          }
        }
      }
    } else if (JSON.parse(e.data)[0] === "chevron_vote_down_no") {
      for (let i = 0; i < get_variables()[3].length; i++) {
        if (get_variables()[3][i][0] === JSON.parse(e.data)[1]) {
          let new_value = parseInt(get_variables()[3][i][5]) - 1;
          if (JSON.parse(e.data)[2] === get_variables()[3][0][16]) {
            document.getElementsByClassName("fa-chevron-down")[i].style.color = "#cc0000";
            edit_chevron(i, new_value, [false, true]);
          } else {
            edit_chevron(i, new_value, null);
          }
        }
      }
    } else if (JSON.parse(e.data)[0] === "yes_no_vote") {
      if (JSON.parse(e.data)[1] === "yes_yes") {
        for (let i = 0; i < get_variables()[3].length; i++) {
          if (get_variables()[3][i][0] === JSON.parse(e.data)[3]) {
            let new_value_yes = JSON.parse(e.data)[5];
            let new_value_no = JSON.parse(e.data)[6];
            if (window.getComputedStyle(document.getElementsByClassName("myChart")[i]).display === "block") {
              make_yes_no_chart(i, [new_value_yes, new_value_no]);
            }
            document.getElementsByClassName("parent_of_fa_check")[i].children[0].style.color = JSON.parse(e.data)[2];
            if (get_variables()[2] > 9) {
              if (JSON.parse(e.data)[4] === get_variables()[3][0][16]) {
                document.querySelectorAll(".post")[i].querySelectorAll(".answer-yes")[0].style.background = "#007e7e";
                edit_vote(i, new_value_yes, new_value_no, [false, false]);
              } else {
                edit_vote(i, new_value_yes, new_value_no, null);
              }
            }
          }
        }
      } else if (JSON.parse(e.data)[1] === "yes_no") {
        for (let i = 0; i < get_variables()[3].length; i++) {
          if (get_variables()[3][i][0] === JSON.parse(e.data)[3]) {
            let new_value_yes = JSON.parse(e.data)[5];
            let new_value_no = JSON.parse(e.data)[6];
            if (window.getComputedStyle(document.getElementsByClassName("myChart")[i]).display === "block") {
              make_yes_no_chart(i, [new_value_yes, new_value_no]);
            }
            document.getElementsByClassName("parent_of_fa_check")[i].children[0].style.color = JSON.parse(e.data)[2];
            if (get_variables()[2] > 9) {
              if (JSON.parse(e.data)[4] === get_variables()[3][0][16]) {
                document.querySelectorAll(".post")[i].querySelectorAll(".answer-yes")[0].style.background = "#00ffd0";
                document.querySelectorAll(".post")[i].querySelectorAll(".answer-no")[0].style.background = "#007e7e";
                edit_vote(i, new_value_yes, new_value_no, [true, false]);
              } else {
                edit_vote(i, new_value_yes, new_value_no, null);
              }
            }
          }
        }
      } else if (JSON.parse(e.data)[1] === "yes_nothing") {
        for (let i = 0; i < get_variables()[3].length; i++) {
          if (get_variables()[3][i][0] === JSON.parse(e.data)[3]) {
            let new_value_yes = JSON.parse(e.data)[5];
            let new_value_no = JSON.parse(e.data)[6];
            if (window.getComputedStyle(document.getElementsByClassName("myChart")[i]).display === "block") {
              make_yes_no_chart(i, [new_value_yes, new_value_no]);
            }
            document.getElementsByClassName("parent_of_fa_check")[i].children[0].style.color = JSON.parse(e.data)[2];
            if (get_variables()[2] > 9) {
              if (JSON.parse(e.data)[4] === get_variables()[3][0][16]) {
                document.querySelectorAll(".post")[i].querySelectorAll(".answer-yes")[0].style.background = "#00ffd0";
                edit_vote(i, new_value_yes, new_value_no, [true, false]);
              } else {
                edit_vote(i, new_value_yes, new_value_no, null);
              }
            }
          }
        }
      } else if (JSON.parse(e.data)[1] === "no_no") {
        for (let i = 0; i < get_variables()[3].length; i++) {
          if (get_variables()[3][i][0] === JSON.parse(e.data)[3]) {
            let new_value_yes = JSON.parse(e.data)[5];
            let new_value_no = JSON.parse(e.data)[6];
            if (window.getComputedStyle(document.getElementsByClassName("myChart")[i]).display === "block") {
              make_yes_no_chart(i, [new_value_yes, new_value_no]);
            }
            document.getElementsByClassName("parent_of_fa_check")[i].children[0].style.color = JSON.parse(e.data)[2];
            if (get_variables()[2] > 9) {
              if (JSON.parse(e.data)[4] === get_variables()[3][0][16]) {
                document.querySelectorAll(".post")[i].querySelectorAll(".answer-no")[0].style.background = "#007e7e";
                edit_vote(i, new_value_yes, new_value_no, [false, false]);
              } else {
                edit_vote(i, new_value_yes, new_value_no, null);
              }
            }
          }
        }
      } else if (JSON.parse(e.data)[1] === "no_yes") {
        for (let i = 0; i < get_variables()[3].length; i++) {
          if (get_variables()[3][i][0] === JSON.parse(e.data)[3]) {
            let new_value_yes = JSON.parse(e.data)[5];
            let new_value_no = JSON.parse(e.data)[6];
            if (window.getComputedStyle(document.getElementsByClassName("myChart")[i]).display === "block") {
              make_yes_no_chart(i, [new_value_yes, new_value_no]);
            }
            document.getElementsByClassName("parent_of_fa_check")[i].children[0].style.color = JSON.parse(e.data)[2];
            if (get_variables()[2] > 9) {
              if (JSON.parse(e.data)[4] === get_variables()[3][0][16]) {
                document.querySelectorAll(".post")[i].querySelectorAll(".answer-yes")[0].style.background = "#007e7e";
                document.querySelectorAll(".post")[i].querySelectorAll(".answer-no")[0].style.background = "#cc0000";
                edit_vote(i, new_value_yes, new_value_no, [false, true]);
              } else {
                edit_vote(i, new_value_yes, new_value_no, null);
              }
            }
          }
        }
      } else if (JSON.parse(e.data)[1] === "no_nothing") {
        for (let i = 0; i < get_variables()[3].length; i++) {
          if (get_variables()[3][i][0] === JSON.parse(e.data)[3]) {
            let new_value_yes = JSON.parse(e.data)[5];
            let new_value_no = JSON.parse(e.data)[6];
            if (window.getComputedStyle(document.getElementsByClassName("myChart")[i]).display === "block") {
              make_yes_no_chart(i, [new_value_yes, new_value_no]);
            }
            document.getElementsByClassName("parent_of_fa_check")[i].children[0].style.color = JSON.parse(e.data)[2];
            if (get_variables()[2] > 9) {
              if (JSON.parse(e.data)[4] === get_variables()[3][0][16]) {
                document.querySelectorAll(".post")[i].querySelectorAll(".answer-no")[0].style.background = "#cc0000";
                edit_vote(i, new_value_yes, new_value_no, [false, true]);
              } else {
                edit_vote(i, new_value_yes, new_value_no, null);
              }
            }
          }
        }
      }
    } else if (JSON.parse(e.data)[0] === "bookmark_on") {
      for (let i = 0; i < get_variables()[3].length; i++) {
        if (get_variables()[3][i][0] === JSON.parse(e.data)[1]) {
          if (get_variables()[2] > 9 && JSON.parse(e.data)[2] === get_variables()[3][0][16]) {
            document.getElementsByClassName("parent_of_bookmark")[i].children[0].className = "fa-solid fa-bookmark";
            document.getElementsByClassName("parent_of_bookmark")[i].children[0].style.color = "#98d9ff";
            edit_bookmark(i, 1);
          }
        }
      }
    } else if (JSON.parse(e.data)[0] === "bookmark_off") {
      for (let i = 0; i < get_variables()[3].length; i++) {
        if (get_variables()[3][i][0] === JSON.parse(e.data)[1]) {
          if (get_variables()[2] > 9 && JSON.parse(e.data)[2] === get_variables()[3][0][16]) {
            document.getElementsByClassName("parent_of_bookmark")[i].children[0].className = "fa-regular fa-bookmark";
            document.getElementsByClassName("parent_of_bookmark")[i].children[0].style.color = null;
            edit_bookmark(i, 0);
          }
        }
      }
    }
  };
});

document.getElementsByClassName("fa-bell")[0].addEventListener("click", function () {
  if (
    window.getComputedStyle(document.getElementById("bell-inner-container")).display === "none" &&
    window.getComputedStyle(document.getElementById("bell-notification-details")).display === "none"
  ) {
    document.getElementsByClassName("bell-notification-title")[0].innerText = "No new polls have been added";
    $("#bell-notification-details").fadeIn(300, function () {});
  } else if (
    window.getComputedStyle(document.getElementById("bell-inner-container")).display !== "none" &&
    window.getComputedStyle(document.getElementById("bell-notification-details")).display === "none"
  ) {
    document.getElementsByClassName("bell-notification-title")[0].innerText = "New polls have been added";
    document.getElementsByClassName("bell-actions")[0].style.display = "block";
    document.getElementsByClassName("bell-actions")[1].style.display = "block";
    $("#bell-notification-details").fadeIn(300, function () {});
  } else if (
    window.getComputedStyle(document.getElementById("bell-inner-container")).display === "none" &&
    window.getComputedStyle(document.getElementById("bell-notification-details")).display !== "none"
  ) {
    $("#bell-notification-details").fadeOut(300, function () {});
  } else if (
    window.getComputedStyle(document.getElementById("bell-inner-container")).display !== "none" &&
    window.getComputedStyle(document.getElementById("bell-notification-details")).display !== "none"
  ) {
    $("#bell-notification-details").fadeOut(300, function () {
      document.getElementsByClassName("bell-actions")[0].style.display = "none";
      document.getElementsByClassName("bell-actions")[1].style.display = "none";
    });
  }
});

document.getElementsByClassName("bell-actions")[0].addEventListener("click", function () {
  $("#bell-notification-details").fadeOut(300, function () {
    document.getElementById("bell-inner-container").style.display = "none";
    document.getElementsByClassName("bell-actions")[0].style.display = "none";
    document.getElementsByClassName("bell-actions")[1].style.display = "none";
    new_post_counter = 1;
  });
  clear_filters();
  null_all_styles();
  $(".post").fadeOut(300, function () {});
  $(".post")
    .promise()
    .done(function () {
      $(".post").not(":first").remove();
      reset_poll_data();
      generate_posts(false);
    });
});

document.getElementsByClassName("bell-actions")[1].addEventListener("click", function () {
  document.getElementById("bell-inner-container").style.display = "none";
  new_post_counter = 1;
});

$(window).click(function (e) {
  if (
    window.getComputedStyle(document.getElementById("bell-notification-details")).display !== "none" &&
    window.getComputedStyle(document.getElementById("bell-notification-details")).opacity === "1" &&
    !e.target.closest("#bell-notification-details")
  ) {
    $("#bell-notification-details").fadeOut(300, function () {
      document.getElementsByClassName("bell-actions")[0].style.display = "none";
      document.getElementsByClassName("bell-actions")[1].style.display = "none";
    });
  }
});
