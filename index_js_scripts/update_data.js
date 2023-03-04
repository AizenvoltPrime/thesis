import {
  conn,
  add_new_post,
  get_variables,
  edit_chevron,
  make_yes_no_chart,
  edit_vote,
  edit_bookmark,
  edit_rating_vote,
  remove_post,
  make_approval_chart,
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
      clone.querySelectorAll(".yes-no-results-container").forEach((main_class) => (main_class.style.display = "none"));
      clone.querySelectorAll(".myChart").forEach((main_class) => main_class.remove());
      clone.querySelectorAll(".answer-yes").forEach((main_class) => main_class.remove());
      clone.querySelectorAll(".answer-no").forEach((main_class) => main_class.remove());
      clone.querySelectorAll(".vote").forEach((main_class) => main_class.remove());
      clone.querySelectorAll(".rating-vote").forEach((main_class) => {
        main_class.style.display = "none";
      });
      clone.querySelectorAll(".rating-vote-results").forEach((main_class) => {
        main_class.style.display = "none";
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
      clone.querySelectorAll(".post-options-inside-container").forEach((main_class) => {
        if (main_class.getElementsByClassName("post-delete")[0]) {
          main_class.getElementsByClassName("post-delete")[0].remove();
        }
        main_class.getElementsByClassName("post-event-location")[0].style.borderBottom = null;
        main_class.getElementsByClassName("post-event-location")[0].style.borderRadius = null;
      });
      clone.querySelectorAll(".post-options-inside-container").forEach((element) => {
        element.style.display = "none";
      });
      clone.querySelectorAll(".total-votes-container").forEach((element) => (element.style.display = "flex"));
      clone.getElementsByClassName("post-critic")[0].style.marginBottom = null;
      clone.querySelectorAll(".post-user-name")[0].innerText = JSON.parse(e.data)[1][1];
      clone.querySelectorAll(".post-question")[0].innerText = JSON.parse(e.data)[1][4];
      clone.querySelectorAll(".score")[0].innerText = JSON.parse(e.data)[1][5];
      clone.querySelectorAll(".post-time")[0].innerText = post_time_relative;
      clone.querySelectorAll(".post-time-detailed")[0].innerText = post_time_detailed;
      clone.querySelectorAll(".total-votes-text")[0].innerText = "Number of Votes: 0";
      document.getElementById("posts-container").prepend(clone);

      if (JSON.parse(e.data)[1][1] === get_variables()[3][0][16]) {
        let new_delete_div = document.createElement("div");
        new_delete_div.className = "post-delete";
        document.getElementsByClassName("post-options-inside-container")[0].appendChild(new_delete_div);
        new_delete_div.setAttribute("data-dir", "delete");
        new_delete_div.innerText = "Delete";

        let new_delete_icon = document.createElement("i");
        new_delete_icon.className = "fa-solid fa-trash-can";
        document
          .getElementsByClassName("post-options-inside-container")[0]
          .getElementsByClassName("post-delete")[0]
          .insertBefore(new_delete_icon, new_delete_div.firstChild);
      } else {
        let element_style = document.getElementsByClassName("post-options-inside-container")[0].getElementsByClassName("post-event-location")[0];
        element_style.style.borderBottom = "0.1em solid #858585";
        element_style.style.borderRadius = "0 0 0.5em 0.5em";
      }
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
      }
      let new_bookmark = document.createElement("i");
      new_bookmark.className = "fa-regular fa-bookmark";
      clone.getElementsByClassName("parent_of_bookmark")[0].appendChild(new_bookmark);
      let new_canvas = document.createElement("canvas");
      new_canvas.className = "myChart";
      clone.getElementsByClassName("chartCard")[0].insertBefore(new_canvas, document.getElementsByClassName("yes-no-total-votes-container")[0]);
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
        clone.getElementsByClassName("parent_of_check_yes_no_details")[0].innerText = "Tie of Yes and No Answers";
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
          JSON.parse(e.data)[1][12],
          JSON.parse(e.data)[1][13],
          JSON.parse(e.data)[1][14],
          "0",
          "0",
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
            document.querySelectorAll(".total-votes-text")[i].innerText =
              "Number of Votes: " + (parseInt(document.querySelectorAll(".total-votes-text")[i].textContent.match(/\d+/)) - 1);
            let new_value_yes = JSON.parse(e.data)[5];
            let new_value_no = JSON.parse(e.data)[6];
            if (window.getComputedStyle(document.getElementsByClassName("myChart")[i]).display === "block") {
              make_yes_no_chart(i, [new_value_yes, new_value_no]);
            }
            document.getElementsByClassName("parent_of_check_yes_no")[i].children[0].style.color = JSON.parse(e.data)[2];
            document.getElementsByClassName("parent_of_check_yes_no")[i].children[0].className = JSON.parse(e.data)[7];
            if (JSON.parse(e.data)[7] === "fa-solid fa-thumbs-up") {
              document.getElementsByClassName("parent_of_check_yes_no_details")[i].innerText = "More Yes Answers";
            } else if (JSON.parse(e.data)[7] === "fa-solid fa-thumbs-down") {
              document.getElementsByClassName("parent_of_check_yes_no_details")[i].innerText = "More No Answers";
            } else if (JSON.parse(e.data)[7] === "fa-solid fa-question") {
              document.getElementsByClassName("parent_of_check_yes_no_details")[i].innerText = "Tie of Yes and No Answers";
            }
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
            if (JSON.parse(e.data)[7] === "fa-solid fa-thumbs-up") {
              document.getElementsByClassName("parent_of_check_yes_no_details")[i].innerText = "More Yes Answers";
            } else if (JSON.parse(e.data)[7] === "fa-solid fa-thumbs-down") {
              document.getElementsByClassName("parent_of_check_yes_no_details")[i].innerText = "More No Answers";
            } else if (JSON.parse(e.data)[7] === "fa-solid fa-question") {
              document.getElementsByClassName("parent_of_check_yes_no_details")[i].innerText = "Tie of Yes and No Answers";
            }
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
            document.querySelectorAll(".total-votes-text")[i].innerText =
              "Number of Votes: " + (parseInt(document.querySelectorAll(".total-votes-text")[i].textContent.match(/\d+/)) + 1);
            let new_value_yes = JSON.parse(e.data)[5];
            let new_value_no = JSON.parse(e.data)[6];
            if (window.getComputedStyle(document.getElementsByClassName("myChart")[i]).display === "block") {
              make_yes_no_chart(i, [new_value_yes, new_value_no]);
            }
            document.getElementsByClassName("parent_of_check_yes_no")[i].children[0].style.color = JSON.parse(e.data)[2];
            document.getElementsByClassName("parent_of_check_yes_no")[i].children[0].className = JSON.parse(e.data)[7];
            if (JSON.parse(e.data)[7] === "fa-solid fa-thumbs-up") {
              document.getElementsByClassName("parent_of_check_yes_no_details")[i].innerText = "More Yes Answers";
            } else if (JSON.parse(e.data)[7] === "fa-solid fa-thumbs-down") {
              document.getElementsByClassName("parent_of_check_yes_no_details")[i].innerText = "More No Answers";
            } else if (JSON.parse(e.data)[7] === "fa-solid fa-question") {
              document.getElementsByClassName("parent_of_check_yes_no_details")[i].innerText = "Tie of Yes and No Answers";
            }
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
            document.querySelectorAll(".total-votes-text")[i].innerText =
              "Number of Votes: " + (parseInt(document.querySelectorAll(".total-votes-text")[i].textContent.match(/\d+/)) - 1);
            let new_value_yes = JSON.parse(e.data)[5];
            let new_value_no = JSON.parse(e.data)[6];
            if (window.getComputedStyle(document.getElementsByClassName("myChart")[i]).display === "block") {
              make_yes_no_chart(i, [new_value_yes, new_value_no]);
            }
            document.getElementsByClassName("parent_of_check_yes_no")[i].children[0].style.color = JSON.parse(e.data)[2];
            document.getElementsByClassName("parent_of_check_yes_no")[i].children[0].className = JSON.parse(e.data)[7];
            if (JSON.parse(e.data)[7] === "fa-solid fa-thumbs-up") {
              document.getElementsByClassName("parent_of_check_yes_no_details")[i].innerText = "More Yes Answers";
            } else if (JSON.parse(e.data)[7] === "fa-solid fa-thumbs-down") {
              document.getElementsByClassName("parent_of_check_yes_no_details")[i].innerText = "More No Answers";
            } else if (JSON.parse(e.data)[7] === "fa-solid fa-question") {
              document.getElementsByClassName("parent_of_check_yes_no_details")[i].innerText = "Tie of Yes and No Answers";
            }
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
            if (JSON.parse(e.data)[7] === "fa-solid fa-thumbs-up") {
              document.getElementsByClassName("parent_of_check_yes_no_details")[i].innerText = "More Yes Answers";
            } else if (JSON.parse(e.data)[7] === "fa-solid fa-thumbs-down") {
              document.getElementsByClassName("parent_of_check_yes_no_details")[i].innerText = "More No Answers";
            } else if (JSON.parse(e.data)[7] === "fa-solid fa-question") {
              document.getElementsByClassName("parent_of_check_yes_no_details")[i].innerText = "Tie of Yes and No Answers";
            }
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
            document.querySelectorAll(".total-votes-text")[i].innerText =
              "Number of Votes: " + (parseInt(document.querySelectorAll(".total-votes-text")[i].textContent.match(/\d+/)) + 1);
            let new_value_yes = JSON.parse(e.data)[5];
            let new_value_no = JSON.parse(e.data)[6];
            if (window.getComputedStyle(document.getElementsByClassName("myChart")[i]).display === "block") {
              make_yes_no_chart(i, [new_value_yes, new_value_no]);
            }
            document.getElementsByClassName("parent_of_check_yes_no")[i].children[0].style.color = JSON.parse(e.data)[2];
            document.getElementsByClassName("parent_of_check_yes_no")[i].children[0].className = JSON.parse(e.data)[7];
            if (JSON.parse(e.data)[7] === "fa-solid fa-thumbs-up") {
              document.getElementsByClassName("parent_of_check_yes_no_details")[i].innerText = "More Yes Answers";
            } else if (JSON.parse(e.data)[7] === "fa-solid fa-thumbs-down") {
              document.getElementsByClassName("parent_of_check_yes_no_details")[i].innerText = "More No Answers";
            } else if (JSON.parse(e.data)[7] === "fa-solid fa-question") {
              document.getElementsByClassName("parent_of_check_yes_no_details")[i].innerText = "Tie of Yes and No Answers";
            }
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
        if (get_variables().length === 3 && JSON.parse(e.data)[1] !== get_variables()[2] && get_variables()[4][1] !== undefined) {
          conn.send(JSON.stringify(["admin_map_coordinates", JSON.parse(e.data)[1], get_variables()[4][1], get_variables()[4][0]]));
        } else if (get_variables().length !== 3 && JSON.parse(e.data)[1] !== get_variables()[3][0][16] && get_variables()[4][1] !== undefined) {
          conn.send(JSON.stringify(["admin_map_coordinates", JSON.parse(e.data)[1], get_variables()[4][1], get_variables()[4][0]]));
        }
      } else {
        if (get_variables()[4][1] !== undefined) {
          conn.send(JSON.stringify(["admin_map_coordinates", JSON.parse(e.data)[1], get_variables()[4][1], get_variables()[4][0]]));
        }
      }
    } else if (JSON.parse(e.data)[0] === "admin_map_coordinates") {
      if (admin_map_bool === true) {
        make_admin_analytics_map(JSON.parse(e.data)[2], JSON.parse(e.data)[3]);
      }
    } else if (JSON.parse(e.data)[0] === "new_online_user") {
      if (admin_map_bool === true) {
        make_admin_analytics_map(JSON.parse(e.data)[1], JSON.parse(e.data)[2]);
      }
    } else if (JSON.parse(e.data)[0] === "admin_map_delete_marker") {
      if (admin_map_bool === true) {
        admin_map_remove_marker(JSON.parse(e.data)[1], JSON.parse(e.data)[2]);
      }
    } else if (JSON.parse(e.data)[0] === "admin_map_status") {
      admin_map_bool = JSON.parse(e.data)[1];
    } else if (JSON.parse(e.data)[0] === "rating_vote") {
      let average_ratings_array = [];
      let ratings_array = [];
      let rating_choice_names = [];
      let zipped = [];

      for (let i = 0; i < JSON.parse(e.data)[3].length; i++) {
        if (i < 20) {
          ratings_array.push(JSON.parse(e.data)[3][i]);
        } else if (i >= 20 && i < 40) {
          average_ratings_array.push(JSON.parse(e.data)[3][i]);
        } else if (i >= 40) {
          rating_choice_names.push(JSON.parse(e.data)[3][i]);
        }
      }

      for (let i = 0; i < rating_choice_names.length; i++) {
        zipped.push({
          array1elem: rating_choice_names[i],
          array2elem: average_ratings_array[i],
        });
      }

      zipped.sort(function (a, b) {
        return b.array2elem - a.array2elem;
      });

      rating_choice_names = [];
      average_ratings_array = [];
      for (let i = 0; i < zipped.length; i++) {
        rating_choice_names.push(zipped[i].array1elem);
        average_ratings_array.push(zipped[i].array2elem);
      }

      for (let i = 0; i < get_variables()[3].length; i++) {
        if (get_variables()[3][i][0] === JSON.parse(e.data)[1]) {
          if (window.getComputedStyle(document.getElementsByClassName("rating-vote-results")[i]).display === "flex") {
            let post_element = document.getElementsByClassName("post")[i].getElementsByClassName("rating-vote-results-inside-container")[0];
            post_element.querySelectorAll(".rating-choices-results").forEach((child) => {
              if (child.getAttribute("data-value") !== "1") {
                child.remove();
              }
            });
            for (let j = 0; j < 20; j++) {
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
              if (rating_choice_names[j] !== null) {
                if (j !== 0) {
                  let clone_rating_choices = post_element.getElementsByClassName("rating-choices-results")[0];
                  let clone = clone_rating_choices.cloneNode(true);
                  clone.setAttribute("data-value", j + 1);
                  post_element.insertBefore(clone, post_element.getElementsByClassName("rating-total-votes-container")[0]);
                  post_element
                    .querySelectorAll(".rating-choices-results")
                    [j].querySelectorAll(".half-star-container-results")
                    .forEach((half_star) => (half_star.style.color = "#f3f3f3"));
                  post_element.querySelectorAll(".rating-choices-results")[j].getElementsByClassName("choice-name")[0].innerText =
                    rating_choice_names[j];
                } else {
                  post_element
                    .querySelectorAll(".rating-choices-results")
                    [j].querySelectorAll(".half-star-container-results")
                    .forEach((half_star) => (half_star.style.color = "#f3f3f3"));
                  post_element.querySelectorAll(".rating-choices-results")[j].getElementsByClassName("choice-name")[0].innerText =
                    rating_choice_names[j];
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
              for (let j = 0; j < 20; j++) {
                let max_star_position = j * 10;
                let star_limit;
                if (ratings_array[j] !== null) {
                  star_limit = parseInt(parseFloat(ratings_array[j]) * 2.0) + max_star_position;
                }
                if (get_variables()[3][i][j + 19] !== null) {
                  if (j + 19 !== 19) {
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
                      get_variables()[3][i][j + 19];
                  } else {
                    post_element
                      .querySelectorAll(".rating-choices")
                      [j].querySelectorAll(".half-star-container")
                      .forEach((half_star) => (half_star.style.color = "#f3f3f3"));
                    post_element.querySelectorAll(".rating-choices")[j].getElementsByClassName("choice-name")[0].innerText =
                      get_variables()[3][i][j + 19];
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
          let post_element = document.getElementsByClassName("post")[i].getElementsByClassName("rating-vote-results-inside-container")[0];
          post_element.getElementsByClassName("rating-total-votes-text")[0].innerText = "Number of Votes: " + JSON.parse(e.data)[3][60];
          document.getElementsByClassName("post")[i].querySelectorAll(".total-votes-text")[0].innerText =
            "Number of Votes: " + JSON.parse(e.data)[3][60];
        }
      }
    } else if (JSON.parse(e.data)[0] === "approval_vote") {
      let user_approval_array = [];
      let results_array = [];
      let approval_choice_names = [];
      let zipped = [];

      for (let i = 0; i < JSON.parse(e.data)[3].length; i++) {
        if (i < 20) {
          user_approval_array.push(JSON.parse(e.data)[3][i]);
        } else if (i >= 20 && i < 40) {
          results_array.push(JSON.parse(e.data)[3][i]);
        } else if (i >= 40) {
          approval_choice_names.push(JSON.parse(e.data)[3][i]);
        }
      }

      for (let i = 0; i < approval_choice_names.length; i++) {
        zipped.push({
          array1elem: approval_choice_names[i],
          array2elem: results_array[i],
        });
      }

      zipped.sort(function (a, b) {
        return b.array2elem - a.array2elem;
      });

      approval_choice_names = [];
      results_array = [];
      for (let i = 0; i < zipped.length; i++) {
        approval_choice_names.push(zipped[i].array1elem);
        results_array.push(zipped[i].array2elem);
      }

      for (let i = 0; i < get_variables()[3].length; i++) {
        if (get_variables()[3][i][0] === JSON.parse(e.data)[1]) {
          if (window.getComputedStyle(document.getElementsByClassName("approval-vote-results")[i]).display === "flex") {
            make_approval_chart(i, approval_choice_names, results_array);
          }
          if (get_variables()[2] > 14) {
            if (JSON.parse(e.data)[2] === get_variables()[3][0][16]) {
              for (let j = 0; j < 20; j++) {
                if (get_variables()[3][i][j + 19] !== null) {
                  if (
                    user_approval_array[j] === 1 &&
                    window.getComputedStyle(document.getElementsByClassName("approval-vote-container")[i]).display === "flex"
                  ) {
                    document.getElementsByClassName("post")[i].getElementsByClassName("approval-choice")[j].style.border = "0.1em solid #cc0000";
                    document.getElementsByClassName("post")[i].getElementsByClassName("approval-choice")[j].style.color = "#cc0000";
                  } else if (
                    user_approval_array[j] === 0 &&
                    window.getComputedStyle(document.getElementsByClassName("approval-vote-container")[i]).display === "flex"
                  ) {
                    document.getElementsByClassName("post")[i].getElementsByClassName("approval-choice")[j].style.border = "0.1em solid #1a1a1b";
                    document.getElementsByClassName("post")[i].getElementsByClassName("approval-choice")[j].style.color = "#f3f3f3";
                  }
                }
              }
              //edit_approval_vote(i, user_approval_array);
            }
          }
        }
      }
    } else if (JSON.parse(e.data)[0] === "delete_post") {
      remove_post(JSON.parse(e.data)[1]);
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

window.addEventListener("click", function (e) {
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
