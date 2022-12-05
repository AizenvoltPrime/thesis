import {
  conn,
  add_new_post,
  get_variables,
  edit_chevron,
  make_yes_no_chart,
  edit_vote,
  edit_bookmark,
  edit_rating_vote,
  edit_approval_vote,
} from "./index.js";
import { make_admin_analytics_map, admin_map_remove_marker } from "./admin_analytics.js";
import { get_posts_ids_inside_region } from "./filters.js";

var DateTime = luxon.DateTime;
let new_post_counter = 1;
let admin_map_bool = false;

export function set_admin_map_bool(map_bool) {
  admin_map_bool = map_bool;
}

//This function clears notification counter.
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
      window.getComputedStyle(document.getElementsByClassName("fa-filter")[0]).backgroundClip !== "text" &&
      window.getComputedStyle(document.getElementById("all-filters")).display === "flex" &&
      get_variables()[0] === false &&
      get_variables()[5] === null &&
      get_posts_ids_inside_region() === null
    ) {
      let post_time_relative = DateTime.fromFormat(JSON.parse(e.data)[1][6], "yyyy-MM-dd HH:mm:ss").toRelative();
      let post_time_detailed = DateTime.fromFormat(JSON.parse(e.data)[1][6], "yyyy-MM-dd HH:mm:ss").toFormat("cccc, dd MMMM, yyyy, TTTT");
      let node = document.getElementsByClassName("post")[0];
      let clone = node.cloneNode(true);

      clone.querySelectorAll(".fa-chevron-up").forEach((icon) => (icon.style.color = null));
      clone.querySelectorAll(".fa-chevron-down").forEach((icon) => (icon.style.color = null));
      clone.querySelectorAll(".answer-yes").forEach((icon) => (icon.style.background = null));
      clone.querySelectorAll(".answer-no").forEach((icon) => (icon.style.background = null));
      clone.querySelectorAll(".show-results").forEach((icon) => (icon.style.background = null));
      clone.querySelectorAll(".parent_of_bookmark").forEach((main_class) => (main_class.innerHTML = ""));
      clone.querySelectorAll(".parent_of_check_yes_no").forEach((main_class) => (main_class.innerHTML = ""));
      clone.querySelectorAll(".poll-timer-container").forEach((main_class) => (main_class.style.display = null));
      clone.querySelectorAll(".fa-clock").forEach((main_class) => (main_class.style.color = null));
      clone.querySelectorAll(".poll-remaining-time").forEach((main_class) => (main_class.innerText = ""));
      clone.querySelectorAll(".chartCard").forEach((main_class) => ((main_class.innerHTML = ""), (main_class.style.display = "none")));
      clone.querySelectorAll(".answer-yes").forEach((main_class) => main_class.remove());
      clone.querySelectorAll(".answer-no").forEach((main_class) => main_class.remove());
      clone.querySelectorAll(".vote").forEach((main_class) => main_class.remove());
      clone.querySelectorAll(".rating-vote").forEach((main_class) => {
        main_class.style.display = "none";
      });
      clone.querySelectorAll(".rating-choices").forEach((main_class) => {
        if (main_class.getAttribute("data-value") !== "1") {
          main_class.remove();
        }
      });
      clone.querySelectorAll(".rating-vote-results").forEach((main_class) => {
        main_class.style.display = "none";
      });
      clone.querySelectorAll(".rating-choices-results").forEach((main_class) => {
        if (main_class.getAttribute("data-value") !== "1") {
          main_class.remove();
        }
      });
      clone.querySelectorAll(".approval-vote-container").forEach((main_class) => {
        main_class.style.display = "none";
      });
      clone.querySelectorAll(".approval-choice").forEach((main_class) => {
        if (main_class.getAttribute("value") !== "1" && main_class.getAttribute("value") !== "2" && main_class.getAttribute("value") !== "3") {
          main_class.remove();
        } else {
          main_class.style.border = null;
          main_class.style.color = null;
        }
      });
      clone.querySelectorAll(".approval-vote-results").forEach((main_class) => {
        main_class.style.display = "none";
      });
      clone.querySelectorAll(".approval-results-table").forEach((main_class) => {
        for (let i = 0; i < main_class.rows.length; i++)
          if (
            main_class.rows[i].getAttribute("data-value") !== "0" &&
            main_class.rows[i].getAttribute("data-value") !== "1" &&
            main_class.rows[i].getAttribute("data-value") !== "2" &&
            main_class.rows[i].getAttribute("data-value") !== "3"
          ) {
            main_class.rows[i].remove();
          }
      });

      clone.querySelectorAll(".post-user-name")[0].innerText = JSON.parse(e.data)[1][1];
      clone.querySelectorAll(".post-question")[0].innerText = JSON.parse(e.data)[1][4];
      clone.querySelectorAll(".score")[0].innerText = JSON.parse(e.data)[1][5];
      clone.querySelectorAll(".post-time")[0].innerText = post_time_relative;
      clone.querySelectorAll(".post-time-detailed")[0].innerText = post_time_detailed;
      document.getElementById("posts-container").prepend(clone);

      if (JSON.parse(e.data)[1][2] == 1) {
        let new_yes_button = document.createElement("button");
        new_yes_button.className = "answer-yes";
        clone.getElementsByClassName("user-question-answers")[0].insertBefore(new_yes_button, clone.getElementsByClassName("show-results")[0]);
        new_yes_button.setAttribute("data-dir", "yes");
        new_yes_button.innerText = "Yes";

        let new_no_button = document.createElement("button");
        new_no_button.className = "answer-no";
        clone.getElementsByClassName("user-question-answers")[0].insertBefore(new_no_button, clone.getElementsByClassName("show-results")[0]);
        new_no_button.setAttribute("data-dir", "no");
        new_no_button.innerText = "No";
      } else if (JSON.parse(e.data)[1][2] == 2 || JSON.parse(e.data)[1][2] == 3 || JSON.parse(e.data)[1][2] == 4) {
        let new_vote_button = document.createElement("button");
        new_vote_button.className = "vote";
        document.getElementsByClassName("user-question-answers")[0].insertBefore(new_vote_button, document.getElementsByClassName("show-results")[0]);
        new_vote_button.setAttribute("data-dir", "vote");
        new_vote_button.innerText = "Vote";

        if (JSON.parse(e.data)[1][2] == 2 && get_variables()[2] > 14) {
          let post_element = document.getElementsByClassName("post")[0];
          for (let j = 0; j < 5; j++) {
            if (JSON.parse(e.data)[1][j + 17] !== null) {
              if (j + 17 !== 17) {
                let clone_rating_choices = post_element.getElementsByClassName("rating-choices")[0];
                let clone = clone_rating_choices.cloneNode(true);
                clone.setAttribute("data-value", j + 1);
                post_element
                  .getElementsByClassName("rating-vote")[0]
                  .insertBefore(clone, post_element.getElementsByClassName("rating-vote")[0].getElementsByClassName("send-rating-button")[0]);
                post_element
                  .querySelectorAll(".rating-choices")
                  [j].querySelectorAll(".half-star-container")
                  .forEach((half_star) => (half_star.style.color = "#f3f3f3"));
                post_element.querySelectorAll(".rating-choices")[j].getElementsByClassName("choice-name")[0].innerText = JSON.parse(e.data)[1][
                  j + 17
                ];
              } else {
                post_element
                  .querySelectorAll(".rating-choices")
                  [j].querySelectorAll(".half-star-container")
                  .forEach((half_star) => (half_star.style.color = "#f3f3f3"));
                post_element.querySelectorAll(".rating-choices")[j].getElementsByClassName("choice-name")[0].innerText = JSON.parse(e.data)[1][
                  j + 17
                ];
              }
            }
          }
        } else if (JSON.parse(e.data)[1][2] == 3 && get_variables()[2] > 14) {
          let post_element = document.getElementsByClassName("post")[0];
          for (let j = 0; j < 5; j++) {
            if (JSON.parse(e.data)[1][j + 17] !== null) {
              if (j + 17 > 19) {
                let clone_approval_choices = post_element.getElementsByClassName("approval-choice")[0];
                let clone = clone_approval_choices.cloneNode(true);
                clone.setAttribute("value", j + 1);
                post_element.getElementsByClassName("approval-choices-container")[0].appendChild(clone);
                post_element.querySelectorAll(".approval-choices-container")[0].getElementsByClassName("approval-choice")[j].innerText = JSON.parse(
                  e.data
                )[1][j + 17];
              } else if (j + 17 <= 19) {
                post_element.querySelectorAll(".approval-choices-container")[0].getElementsByClassName("approval-choice")[j].innerText = JSON.parse(
                  e.data
                )[1][j + 17];
              }
            }
          }
        }
      }
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
        new_check.className = "fa-solid fa-question";
        clone.getElementsByClassName("parent_of_check_yes_no")[0].appendChild(new_check);
        clone.getElementsByClassName("parent_of_check_yes_no")[0].children[0].style.color = "#b5b5b5";
      }

      if (get_variables()[2] > 14) {
        add_new_post(JSON.parse(e.data)[1]);
      } else if (get_variables()[2] <= 14) {
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
          JSON.parse(e.data)[1][17],
          JSON.parse(e.data)[1][18],
          JSON.parse(e.data)[1][19],
          JSON.parse(e.data)[1][20],
          JSON.parse(e.data)[1][21],
        ]);
      }
    } else if (
      JSON.parse(e.data)[0] === "new_post_added" &&
      (window.getComputedStyle(document.getElementsByClassName("fa-fire-flame-curved")[0]).backgroundClip === "text" ||
        window.getComputedStyle(document.getElementsByClassName("fa-table-list")[0]).backgroundClip === "text" ||
        (document.forms["search-box-container"]["search-text"].value !== "" &&
          document.forms["search-box-container"]["search-text"].value !== undefined) ||
        window.getComputedStyle(document.getElementsByClassName("fa-filter")[0]).backgroundClip === "text" ||
        window.getComputedStyle(document.getElementById("all-filters")).display !== "flex" ||
        get_variables()[0] === true ||
        get_variables()[5] !== null ||
        get_posts_ids_inside_region() !== null)
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
    } else if (JSON.parse(e.data)[0] === "yes_no_vote" && window.getComputedStyle(document.getElementById("all-filters")).display !== "none") {
      if (JSON.parse(e.data)[1] === "yes_yes") {
        for (let i = 0; i < get_variables()[3].length; i++) {
          if (get_variables()[3][i][0] === JSON.parse(e.data)[3]) {
            let new_value_yes = JSON.parse(e.data)[5];
            let new_value_no = JSON.parse(e.data)[6];
            if (window.getComputedStyle(document.getElementsByClassName("myChart")[i]).display === "block") {
              make_yes_no_chart(i, [new_value_yes, new_value_no]);
            }
            document.getElementsByClassName("parent_of_check_yes_no")[i].children[0].style.color = JSON.parse(e.data)[2];
            document.getElementsByClassName("parent_of_check_yes_no")[i].children[0].className = JSON.parse(e.data)[7];
            if (get_variables()[2] > 14) {
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
            document.getElementsByClassName("parent_of_check_yes_no")[i].children[0].style.color = JSON.parse(e.data)[2];
            document.getElementsByClassName("parent_of_check_yes_no")[i].children[0].className = JSON.parse(e.data)[7];
            if (get_variables()[2] > 14) {
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
            document.getElementsByClassName("parent_of_check_yes_no")[i].children[0].style.color = JSON.parse(e.data)[2];
            document.getElementsByClassName("parent_of_check_yes_no")[i].children[0].className = JSON.parse(e.data)[7];
            if (get_variables()[2] > 14) {
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
            document.getElementsByClassName("parent_of_check_yes_no")[i].children[0].style.color = JSON.parse(e.data)[2];
            document.getElementsByClassName("parent_of_check_yes_no")[i].children[0].className = JSON.parse(e.data)[7];
            if (get_variables()[2] > 14) {
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
            document.getElementsByClassName("parent_of_check_yes_no")[i].children[0].style.color = JSON.parse(e.data)[2];
            document.getElementsByClassName("parent_of_check_yes_no")[i].children[0].className = JSON.parse(e.data)[7];
            if (get_variables()[2] > 14) {
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
            document.getElementsByClassName("parent_of_check_yes_no")[i].children[0].style.color = JSON.parse(e.data)[2];
            document.getElementsByClassName("parent_of_check_yes_no")[i].children[0].className = JSON.parse(e.data)[7];
            if (get_variables()[2] > 14) {
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
    } else if (JSON.parse(e.data)[0] === "bookmark_on" && window.getComputedStyle(document.getElementById("all-filters")).display !== "none") {
      for (let i = 0; i < get_variables()[3].length; i++) {
        if (get_variables()[3][i][0] === JSON.parse(e.data)[1]) {
          if (get_variables()[2] > 14 && JSON.parse(e.data)[2] === get_variables()[3][0][16]) {
            document.getElementsByClassName("parent_of_bookmark")[i].children[0].className = "fa-solid fa-bookmark";
            document.getElementsByClassName("parent_of_bookmark")[i].children[0].style.color = "#98d9ff";
            edit_bookmark(i, 1);
          }
        }
      }
    } else if (JSON.parse(e.data)[0] === "bookmark_off" && window.getComputedStyle(document.getElementById("all-filters")).display !== "none") {
      for (let i = 0; i < get_variables()[3].length; i++) {
        if (get_variables()[3][i][0] === JSON.parse(e.data)[1]) {
          if (get_variables()[2] > 14 && JSON.parse(e.data)[2] === get_variables()[3][0][16]) {
            document.getElementsByClassName("parent_of_bookmark")[i].children[0].className = "fa-regular fa-bookmark";
            document.getElementsByClassName("parent_of_bookmark")[i].children[0].style.color = null;
            edit_bookmark(i, 0);
          }
        }
      }
    } else if (JSON.parse(e.data)[0] === "admin_analytics_map") {
      admin_map_bool = JSON.parse(e.data)[2];
      if (get_variables()[2] > 14) {
        if (JSON.parse(e.data)[1] !== get_variables()[3][0][16] && get_variables()[4][1] !== undefined) {
          conn.send(JSON.stringify(["admin_map_coordinates", JSON.parse(e.data)[1], get_variables()[4][1], get_variables()[4][0]]));
        }
      } else {
        if (get_variables()[4][1] !== undefined) {
          conn.send(JSON.stringify(["admin_map_coordinates", JSON.parse(e.data)[1], get_variables()[4][1], get_variables()[4][0]]));
        }
      }
    } else if (JSON.parse(e.data)[0] === "admin_map_coordinates") {
      if (admin_map_bool === true) {
        if (JSON.parse(e.data)[1] === get_variables()[3][0][16]) {
          make_admin_analytics_map(JSON.parse(e.data)[2], JSON.parse(e.data)[3]);
        }
      }
    } else if (JSON.parse(e.data)[0] === "new_online_user") {
      if (get_variables()[2] > 14) {
        if (admin_map_bool === true) {
          make_admin_analytics_map(JSON.parse(e.data)[1], JSON.parse(e.data)[2]);
        }
      }
    } else if (JSON.parse(e.data)[0] === "admin_map_delete_marker") {
      if (admin_map_bool === true) {
        admin_map_remove_marker(JSON.parse(e.data)[1], JSON.parse(e.data)[2]);
      }
    } else if (JSON.parse(e.data)[0] === "admin_map_status") {
      admin_map_bool = JSON.parse(e.data)[1];
    } else if (JSON.parse(e.data)[0] === "rating_vote") {
      let average_ratings_array = [
        JSON.parse(e.data)[8],
        JSON.parse(e.data)[9],
        JSON.parse(e.data)[10],
        JSON.parse(e.data)[11],
        JSON.parse(e.data)[12],
      ];
      let ratings_array = [JSON.parse(e.data)[3], JSON.parse(e.data)[4], JSON.parse(e.data)[5], JSON.parse(e.data)[6], JSON.parse(e.data)[7]];
      for (let i = 0; i < get_variables()[3].length; i++) {
        if (get_variables()[3][i][0] === JSON.parse(e.data)[1]) {
          if (window.getComputedStyle(document.getElementsByClassName("rating-vote-results")[i]).display === "flex") {
            let post_element = document.getElementsByClassName("post")[i];
            let choice_names_index;
            post_element.querySelectorAll(".rating-choices-results").forEach((child) => {
              if (child.getAttribute("data-value") !== "1") {
                child.remove();
              }
            });
            for (let j = 0; j < 5; j++) {
              if (get_variables()[2] > 14) {
                choice_names_index = j + 17;
              } else {
                choice_names_index = j + 9;
              }
              let max_star_position = j * 10;
              let star_limit;
              if (average_ratings_array[j] !== null) {
                let first_digit = parseFloat(average_ratings_array[j][0]);
                let average_rating = parseFloat(average_ratings_array[j]).toFixed(3);
                if (average_rating < first_digit + 0.25) {
                  average_rating = parseFloat(average_ratings_array[j][0]);
                } else if (average_rating >= first_digit + 0.25 && average_rating <= first_digit + 0.5) {
                  average_rating = parseFloat(average_ratings_array[j][0]) + 0.5;
                } else if (average_rating >= first_digit + 0.5 && average_rating < first_digit + 0.75) {
                  average_rating = parseFloat(average_ratings_array[j][0]) + 0.5;
                } else if (average_rating >= first_digit + 0.75) {
                  average_rating = parseFloat(average_ratings_array[j][0]) + 1.0;
                }
                star_limit = parseInt(average_rating * 2.0) + max_star_position;
              }
              if (get_variables()[3][i][choice_names_index] !== null) {
                if (choice_names_index !== choice_names_index - j) {
                  let clone_rating_choices = post_element.getElementsByClassName("rating-choices-results")[0];
                  let clone = clone_rating_choices.cloneNode(true);
                  clone.setAttribute("data-value", j + 1);
                  post_element.getElementsByClassName("rating-vote-results")[0].appendChild(clone);
                  post_element
                    .querySelectorAll(".rating-choices-results")
                    [j].querySelectorAll(".half-star-container-results")
                    .forEach((half_star) => (half_star.style.color = "#f3f3f3"));
                  post_element.querySelectorAll(".rating-choices-results")[j].getElementsByClassName("choice-name")[0].innerText =
                    get_variables()[3][i][choice_names_index];
                } else {
                  post_element
                    .querySelectorAll(".rating-choices-results")
                    [j].querySelectorAll(".half-star-container-results")
                    .forEach((half_star) => (half_star.style.color = "#f3f3f3"));
                  post_element.querySelectorAll(".rating-choices-results")[j].getElementsByClassName("choice-name")[0].innerText =
                    get_variables()[3][i][choice_names_index];
                }
                if (average_ratings_array[j] !== null) {
                  for (let k = max_star_position; k < star_limit; k++) {
                    post_element.getElementsByClassName("half-star-container-results")[k].style.color = "#00ffd0";
                  }
                }
              }
            }
          }
          if (get_variables()[2] > 14) {
            if (JSON.parse(e.data)[2] === get_variables()[3][0][16]) {
              let post_element = document.getElementsByClassName("post")[i];
              post_element.querySelectorAll(".rating-choices").forEach((child) => {
                if (child.getAttribute("data-value") !== "1") {
                  child.remove();
                }
              });
              for (let j = 0; j < 5; j++) {
                let max_star_position = j * 10;
                let star_limit;
                if (ratings_array[j] !== null) {
                  star_limit = parseInt(parseFloat(ratings_array[j]) * 2.0) + max_star_position;
                }
                if (get_variables()[3][i][j + 17] !== null) {
                  if (j + 17 !== 17) {
                    let clone_rating_choices = post_element.getElementsByClassName("rating-choices")[0];
                    let clone = clone_rating_choices.cloneNode(true);
                    clone.setAttribute("data-value", j + 1);
                    post_element
                      .getElementsByClassName("rating-vote")[0]
                      .insertBefore(clone, post_element.getElementsByClassName("rating-vote")[0].getElementsByClassName("send-rating-button")[0]);
                    post_element
                      .querySelectorAll(".rating-choices")
                      [j].querySelectorAll(".half-star-container")
                      .forEach((half_star) => (half_star.style.color = "#f3f3f3"));
                    post_element.querySelectorAll(".rating-choices")[j].getElementsByClassName("choice-name")[0].innerText =
                      get_variables()[3][i][j + 17];
                  } else {
                    post_element
                      .querySelectorAll(".rating-choices")
                      [j].querySelectorAll(".half-star-container")
                      .forEach((half_star) => (half_star.style.color = "#f3f3f3"));
                    post_element.querySelectorAll(".rating-choices")[j].getElementsByClassName("choice-name")[0].innerText =
                      get_variables()[3][i][j + 17];
                  }
                  if (ratings_array[j] !== null) {
                    for (let k = max_star_position; k < star_limit; k++) {
                      post_element.getElementsByClassName("half-star-container")[k].style.color = "#00ffd0";
                    }
                  }
                }
              }
              edit_rating_vote(i, ratings_array);
            }
          }
        }
      }
    } else if (JSON.parse(e.data)[0] === "approval_vote") {
      let results_array = [JSON.parse(e.data)[8], JSON.parse(e.data)[9], JSON.parse(e.data)[10], JSON.parse(e.data)[11], JSON.parse(e.data)[12]];
      let user_approval_array = [JSON.parse(e.data)[3], JSON.parse(e.data)[4], JSON.parse(e.data)[5], JSON.parse(e.data)[6], JSON.parse(e.data)[7]];

      for (let i = 0; i < get_variables()[3].length; i++) {
        if (get_variables()[3][i][0] === JSON.parse(e.data)[1]) {
          if (window.getComputedStyle(document.getElementsByClassName("approval-vote-results")[i]).display === "flex") {
            let post_element = document.getElementsByClassName("post")[i];
            let choice_names_index;
            if (get_variables()[2] > 14) {
              choice_names_index = 17;
            } else {
              choice_names_index = 9;
            }
            for (let j = 0; j < results_array.length; j++) {
              if (j < 3) {
                post_element.getElementsByClassName("approval-results-table")[0].rows[j + 1].cells[0].innerText =
                  get_variables()[3][i][j + choice_names_index];
                if (results_array[j] !== null) {
                  post_element.getElementsByClassName("approval-results-table")[0].rows[j + 1].cells[1].innerText = results_array[j];
                } else {
                  post_element.getElementsByClassName("approval-results-table")[0].rows[j + 1].cells[1].innerText = "0";
                }
              } else if (j >= 3 && get_variables()[3][i][j + choice_names_index] !== null) {
                if (document.querySelectorAll(".approval-results-table")[i].rows[j + 1]) {
                  document.querySelectorAll(".approval-results-table")[i].rows[j + 1].remove();
                }
                let top_row = post_element.getElementsByClassName("approval-results-table")[0].rows[1];
                let clone = top_row.cloneNode(true);
                post_element.getElementsByClassName("approval-results-table")[0].children[0].appendChild(clone);
                document.querySelectorAll(".approval-results-table")[i].rows[j + 1].setAttribute("data-value", j + 1);
                post_element.getElementsByClassName("approval-results-table")[0].rows[j + 1].cells[0].innerText =
                  get_variables()[3][i][j + choice_names_index];
                if (results_array[j] !== null) {
                  post_element.getElementsByClassName("approval-results-table")[0].rows[j + 1].cells[1].innerText = results_array[j];
                } else {
                  post_element.getElementsByClassName("approval-results-table")[0].rows[j + 1].cells[1].innerText = "0";
                }
              } else if (j >= 3 && get_variables()[3][i][j + choice_names_index] === null) {
                if (document.querySelectorAll(".approval-results-table")[i].rows[j + 1]) {
                  document.querySelectorAll(".approval-results-table")[i].rows[j + 1].remove();
                }
              }
            }
          }
          if (get_variables()[2] > 14) {
            if (JSON.parse(e.data)[2] === get_variables()[3][0][16]) {
              for (let j = 0; j < 5; j++) {
                if (get_variables()[3][i][j + 17] !== null) {
                  if (user_approval_array[j] === 1) {
                    document.getElementsByClassName("post")[i].getElementsByClassName("approval-choice")[j].style.border = "0.1em solid #cc0000";
                    document.getElementsByClassName("post")[i].getElementsByClassName("approval-choice")[j].style.color = "#cc0000";
                  } else if (user_approval_array[j] === 0) {
                    document.getElementsByClassName("post")[i].getElementsByClassName("approval-choice")[j].style.border = "0.1em solid #1a1a1b";
                    document.getElementsByClassName("post")[i].getElementsByClassName("approval-choice")[j].style.color = "#f3f3f3";
                  }
                }
              }
              edit_approval_vote(i, user_approval_array);
            }
          }
        }
      }
    }
  };
});

//This is for notification bell functionality.
document.getElementsByClassName("fa-bell")[0].addEventListener("click", function () {
  if (
    window.getComputedStyle(document.getElementById("bell-inner-container")).display === "none" &&
    window.getComputedStyle(document.getElementById("bell-notification-details")).display === "none"
  ) {
    document.getElementsByClassName("bell-notification-title")[0].innerText = "0 new polls have been added";
    $("#bell-notification-details").fadeIn(300, function () {});
  } else if (
    window.getComputedStyle(document.getElementById("bell-inner-container")).display !== "none" &&
    window.getComputedStyle(document.getElementById("bell-notification-details")).display === "none"
  ) {
    if (new_post_counter - 1 === 1) {
      document.getElementsByClassName("bell-notification-title")[0].innerText = new_post_counter - 1 + " new poll has been added";
      document.getElementsByClassName("bell-actions")[0].innerText = "Check it out";
    } else {
      document.getElementsByClassName("bell-notification-title")[0].innerText = new_post_counter - 1 + " new polls have been added";
      document.getElementsByClassName("bell-actions")[0].innerText = "Check them out";
    }
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

//This is for the functionality of the pop-up window that appears when user clicks the bell icon and there are notifications.
document.getElementsByClassName("bell-actions")[0].addEventListener("click", function () {
  $("#bell-notification-details").fadeOut(300, function () {
    document.getElementById("bell-inner-container").style.display = "none";
    document.getElementsByClassName("bell-actions")[0].style.display = "none";
    document.getElementsByClassName("bell-actions")[1].style.display = "none";
    new_post_counter = 1;
  });
  document.getElementsByClassName("nav-element")[0].click();
});

//This is for the functionality of the pop-up window that appears when user clicks the bell icon and there are notifications.
document.getElementsByClassName("bell-actions")[1].addEventListener("click", function () {
  $("#bell-notification-details").fadeOut(300, function () {
    document.getElementById("bell-inner-container").style.display = "none";
    document.getElementsByClassName("bell-actions")[0].style.display = "none";
    document.getElementsByClassName("bell-actions")[1].style.display = "none";
    new_post_counter = 1;
  });
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
