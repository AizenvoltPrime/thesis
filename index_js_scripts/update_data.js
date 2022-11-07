import { conn, add_new_post, get_variables, edit_chevron } from "./index.js";

var DateTime = luxon.DateTime;
addEventListener("DOMContentLoaded", (event) => {
  conn.onmessage = function (e) {
    if (JSON.parse(e.data)[0] === "new_post_added") {
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

      if (get_variables()[2] > 10) {
        add_new_post(JSON.parse(e.data)[1]);
      } else {
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
    } else if (JSON.parse(e.data)[0] === "chevron_vote_up_up") {
      console.log("UP.UP:" + e.data);
      for (let i = 0; i < get_variables()[3].length; i++) {
        if (get_variables()[3][i][0] === JSON.parse(e.data)[1]) {
          let new_value = parseInt(get_variables()[3][i][5]) - 1;
          if (JSON.parse(e.data)[2] === get_variables()[3][0][16]) {
            document.getElementsByClassName("fa-chevron-up")[i].style.color = "#b5b5b5";
          }
          edit_chevron(i, new_value, [false, false]);
        }
      }
    } else if (JSON.parse(e.data)[0] === "chevron_vote_up_down") {
      console.log("UP.DOWN:" + e.data);
      for (let i = 0; i < get_variables()[3].length; i++) {
        if (get_variables()[3][i][0] === JSON.parse(e.data)[1]) {
          let new_value = parseInt(get_variables()[3][i][5]) + 2;
          if (JSON.parse(e.data)[2] === get_variables()[3][0][16]) {
            document.getElementsByClassName("fa-chevron-up")[i].style.color = "#00ffd0";
            document.getElementsByClassName("fa-chevron-down")[i].style.color = "#b5b5b5";
          }
          edit_chevron(i, new_value, [true, false]);
        }
      }
    } else if (JSON.parse(e.data)[0] === "chevron_vote_up_no") {
      console.log("UP.NO:" + e.data);
      for (let i = 0; i < get_variables()[3].length; i++) {
        if (get_variables()[3][i][0] === JSON.parse(e.data)[1]) {
          let new_value = parseInt(get_variables()[3][i][5]) + 1;
          if (JSON.parse(e.data)[2] === get_variables()[3][0][16]) {
            document.getElementsByClassName("fa-chevron-up")[i].style.color = "#00ffd0";
          }
          edit_chevron(i, new_value, [true, false]);
        }
      }
    } else if (JSON.parse(e.data)[0] === "chevron_vote_down_down") {
      console.log("DOWN.DOWN:" + e.data);
      for (let i = 0; i < get_variables()[3].length; i++) {
        if (get_variables()[3][i][0] === JSON.parse(e.data)[1]) {
          let new_value = parseInt(get_variables()[3][i][5]) + 1;
          if (JSON.parse(e.data)[2] === get_variables()[3][0][16]) {
            document.getElementsByClassName("fa-chevron-down")[i].style.color = "#b5b5b5";
          }
          edit_chevron(i, new_value, [false, false]);
        }
      }
    } else if (JSON.parse(e.data)[0] === "chevron_vote_down_up") {
      console.log("DOWN.UP:" + e.data);
      for (let i = 0; i < get_variables()[3].length; i++) {
        if (get_variables()[3][i][0] === JSON.parse(e.data)[1]) {
          let new_value = parseInt(get_variables()[3][i][5]) - 2;
          if (JSON.parse(e.data)[2] === get_variables()[3][0][16]) {
            document.getElementsByClassName("fa-chevron-up")[i].style.color = "#b5b5b5";
            document.getElementsByClassName("fa-chevron-down")[i].style.color = "#cc0000";
          }
          edit_chevron(i, new_value, [false, true]);
        }
      }
    } else if (JSON.parse(e.data)[0] === "chevron_vote_down_no") {
      console.log("DOWN.NO:" + e.data);
      for (let i = 0; i < get_variables()[3].length; i++) {
        if (get_variables()[3][i][0] === JSON.parse(e.data)[1]) {
          let new_value = parseInt(get_variables()[3][i][5]) - 1;
          if (JSON.parse(e.data)[2] === get_variables()[3][0][16]) {
            document.getElementsByClassName("fa-chevron-down")[i].style.color = "#cc0000";
          }
          edit_chevron(i, new_value, [false, true]);
        }
      }
    }
  };
});
