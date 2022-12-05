import { clear_region_posts } from "../geojson/greece_regions.js";
import { null_style, clear_filters } from "./filters.js";
import { clear_bell_counter } from "./update_data.js";

let user_choice = "none"; //poll choice
let specific_user_posts = null; //this is for showing posts of a specified user
let question_choice = "none"; //yes/no response choices
let template_status = "0000001"; //used to navigate through poll templates
let user_chevron_vote = []; //like/dislike vote
let user_yes_no_vote = []; //yes/no vote
let node = []; //used for cloning posts template
let clone = []; //used to store cloned posts data
let post_data = []; //used to store all posts data
let ctx = []; //used for charts
let myChart = []; //the chart
let time_limit; //stores the time when the poll will close
let poll_choices = []; //stores poll choices
let post_category; //stores post category
let poll_choices_number; //number of poll choices
let bookmarks_active = false; //helps decide whether to use filters on all posts or on bookmakred posts only
let user_coordinates = []; //stores user coordinates
let event_coordinates = []; //stores coordinates of the event when location restricted voting is used
var DateTime = luxon.DateTime; //used for time features
Chart.defaults.font.size = 20;

let min_time; //minimum time for poll timer
let min_day; //earliest day for poll timer
let max_day; //farthest possible day for poll timer

var event_location_map = L.map("event-location-map").setView([38.222807817437634, 21.783142089843754], 7);
let event_marker = null; //marker for location of event
let allowed_vote_radius = null; //the circle around the event marker
let event_radius = null; //the radius of the circle is saved in this variable

//Websocket creation
export let conn = new WebSocket("ws://localhost:8080");
conn.onopen = function (e) {
  console.log("Connection established!");
};

L.tileLayer("https://{s}.tile.osm.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
}).addTo(event_location_map);

//used for creating marker and circle radius when user clicks the map
event_location_map.on("click", function (e) {
  event_coordinates = [e.latlng.lat, e.latlng.lng];
  if (event_marker !== null) {
    event_location_map.removeLayer(event_marker);
  }
  if (allowed_vote_radius !== null) {
    event_location_map.removeLayer(allowed_vote_radius);
  }
  event_marker = L.marker([event_coordinates[0], event_coordinates[1]])
    .bindPopup("Location Coordinates: " + "<br>" + event_coordinates[0] + "<br>" + event_coordinates[1])
    .addTo(event_location_map);
  if (document.forms["location-choice"]["radius"].value !== "" && document.forms["location-choice"]["radius"].value >= 5000) {
    allowed_vote_radius = L.circle([event_coordinates[0], event_coordinates[1]], { radius: document.forms["location-choice"]["radius"].value }).addTo(
      event_location_map
    );
  } else {
    allowed_vote_radius = L.circle([event_coordinates[0], event_coordinates[1]], { radius: 5000 }).addTo(event_location_map);
  }
  event_radius = allowed_vote_radius.getRadius();
});

//used to change default radius for location restricted voting
document.getElementsByClassName("fa-circle-chevron-right")[1].addEventListener("click", function () {
  if (document.forms["location-choice"]["radius"].value >= 5000) {
    if (window.getComputedStyle(document.getElementById("warning-radius-too-small")).display !== "none") {
      $("#warning-radius-too-small").fadeOut(300, function () {});
    }
    if (allowed_vote_radius !== null) {
      event_location_map.removeLayer(allowed_vote_radius);
    }
    allowed_vote_radius = L.circle([event_coordinates[0], event_coordinates[1]], { radius: document.forms["location-choice"]["radius"].value }).addTo(
      event_location_map
    );
    event_radius = allowed_vote_radius.getRadius();
  } else {
    if (window.getComputedStyle(document.getElementById("warning-no-location-selected")).display !== "none") {
      $("#warning-no-location-selected").fadeOut(300, function () {
        $("#warning-radius-too-small").fadeIn(300, function () {});
      });
    } else {
      $("#warning-radius-too-small").fadeIn(300, function () {});
    }
  }
});

//This is for button animation.
(function () {
  var d = document.getElementById("username-change");
  var e = document.getElementById("password-change");
  function addAnim() {
    d.classList.add("animated");
    d.removeEventListener("mouseover", addAnim);
    e.classList.add("animated");
    e.removeEventListener("mouseover", addAnim);
  }

  // listen to mouseover for the container
  d.addEventListener("mouseover", addAnim);
  e.addEventListener("mouseover", addAnim);
})();

generate_posts(false);

//Get user coordinates
fetch("process_data.php", {
  method: "POST",
  body: JSON.stringify({
    request: "get_geolocation_data",
  }),
})
  .then((res) => res.json())
  .then((response) => {
    const loc = JSON.parse(response).loc.split(",");
    user_coordinates[0] = loc[0];
    user_coordinates[1] = loc[1];
    setTimeout(() => {
      conn.send(JSON.stringify(["new_online_user", user_coordinates[0], user_coordinates[1]]));
    }, 1000);
  });

//This is for when the user clicks the "Plus" icon.
document.getElementById("add-post-icon").addEventListener("click", function () {
  bookmarks_active = false;
  specific_user_posts = null;
  document.getElementById("next-step").disabled = false;
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
          $("#notification-container").fadeOut(300, function () {});
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
              document.getElementById("next-step").style.display = "block";
              document.getElementById("next-step").style.animation = "fade_in_show 0.5s";
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
              document.getElementById("next-step").style.display = "block";
              document.getElementById("next-step").style.animation = "fade_in_show 0.5s";
            });
        }
      }
    });
});

//Used to navigate through poll templates
document.getElementById("next-step").addEventListener("click", function () {
  time_limit = document.forms["time-choice"]["time-limit-choice"].value;
  post_category = document.getElementById("categories").value;
  poll_choices_number = document.getElementById("poll-choices").value;
  if (template_status === "0000001") {
    if (user_choice === "none") {
      $("#warning-nothing-selected").fadeIn(300, function () {});
    } else if (user_choice !== "none") {
      $("#warning-nothing-selected").fadeOut(300, function () {});
      $("#poll-selection").fadeOut(300, function () {});
      $("#next-step").fadeOut(300, function () {});
      $("#next-step")
        .promise()
        .done(function () {
          if (user_choice === "rating" || user_choice === "approval" || user_choice === "ranking") {
            $("#poll-choices-number-container").fadeIn(300, function () {});
            $("#next-step").fadeIn(300, function () {});
            template_status = "special-1";
          } else {
            $("#poll-template-time-choice").fadeIn(300, function () {});
            $("#next-step").fadeIn(300, function () {});
            template_status = "0000010";
          }
        });
    }
  } else if (template_status === "special-1") {
    if (poll_choices_number === "0") {
      $("#warning-no-poll-choice-number-selected").fadeIn(300, function () {});
    } else {
      $("#warning-no-poll-choice-number-selected").fadeOut(300, function () {});
      $("#poll-choices-number-container").fadeOut(300, function () {});
      $("#next-step").fadeOut(300, function () {});
      $("#next-step")
        .promise()
        .done(function () {
          let pos = 0;
          for (let i = 0; i < parseInt(poll_choices_number) + 2; i++) {
            let new_poll_choices_instruction = document.createElement("label");
            new_poll_choices_instruction.className = "poll-choices-instruction";
            document.getElementById("input-poll-choices").appendChild(new_poll_choices_instruction);
            document.getElementById("input-poll-choices").children[i + pos].innerText = "Choice " + (i + 1);

            let new_write_poll_choice = document.createElement("input");
            new_write_poll_choice.className = "write-poll-choice";
            document.getElementById("input-poll-choices").appendChild(new_write_poll_choice);
            document.getElementById("input-poll-choices").children[i + pos + 1].setAttribute("type", "text");
            document.getElementById("input-poll-choices").children[i + pos + 1].name = "poll-choice";
            document.getElementById("input-poll-choices").children[i + pos + 1].maxLength = 20;
            document.getElementById("input-poll-choices").children[i + pos + 1].placeholder = "Type Choice " + (i + 1);
            pos++;
          }
          $("#input-poll-choices").fadeIn(300, function () {});
          $("#next-step").fadeIn(300, function () {});
          template_status = "special-2";
        });
    }
  } else if (template_status === "special-2") {
    let pass = true;
    for (let i = 0; i < document.querySelectorAll("#input-poll-choices .write-poll-choice").length; i++) {
      poll_choices[i] = document.forms["input-poll-choices"]["poll-choice"][i].value.trim();
      if (poll_choices[i] === "") {
        pass = false;
        $("#warning-no-input-poll-choices").fadeIn(300, function () {});
      }
    }
    if (pass === true) {
      $("#warning-no-input-poll-choices").fadeOut(300, function () {});
      $("#input-poll-choices").fadeOut(300, function () {});
      $("#next-step").fadeOut(300, function () {});
      $("#next-step")
        .promise()
        .done(function () {
          $("#poll-template-time-choice").fadeIn(300, function () {});
          $("#next-step").fadeIn(300, function () {});
          template_status = "0000010";
        });
    }
  } else if (template_status === "0000010") {
    if (question_choice !== "yes-time-limit" && question_choice !== "no-time-limit") {
      $("#warning-no-time-limit-choice").fadeIn(300, function () {});
    } else if (question_choice === "yes-time-limit") {
      $("#poll-template-time-choice").fadeOut(300, function () {});
      $("#warning-no-time-limit-choice").fadeOut(300, function () {});
      $("#next-step").fadeOut(300, function () {
        $("#time-choice").fadeIn(300, function () {});
        $("#next-step").fadeIn(300, function () {});
      });
      choice_dehighlight("yes-time-limit");
      question_choice = "none";
      template_status = "0000100";
    } else if (question_choice === "no-time-limit") {
      $("#poll-template-time-choice").fadeOut(300, function () {});
      $("#warning-no-time-limit-choice").fadeOut(300, function () {});
      $("#next-step").fadeOut(300, function () {});
      $("#next-step")
        .promise()
        .done(function () {
          $("#poll-template-location-restriction").fadeIn(300, function () {});
          $("#next-step").fadeIn(300, function () {});
          choice_dehighlight("no-time-limit");
          question_choice = "none";
          template_status = "0001000";
        });
    }
  } else if (template_status === "0000100") {
    if (time_limit === "") {
      $("#warning-no-time-limit").fadeIn(300, function () {});
    } else if (time_limit !== "") {
      $("#time-choice").fadeOut(300, function () {});
      $("#warning-no-time-limit").fadeOut(300, function () {});
      $("#next-step").fadeOut(300, function () {
        $("#poll-template-location-restriction").fadeIn(300, function () {});
        $("#next-step").fadeIn(300, function () {});
        template_status = "0001000";
      });
    }
  } else if (template_status === "0001000") {
    if (question_choice !== "yes-location-restriction" && question_choice !== "no-location-restriction") {
      $("#warning-no-location-restriction-choice").fadeIn(300, function () {});
    } else if (question_choice === "yes-location-restriction") {
      $("#poll-template-location-restriction").fadeOut(300, function () {});
      $("#warning-no-location-restriction-choice").fadeOut(300, function () {});
      $("#next-step").fadeOut(300, function () {
        $("#location-choice").fadeIn(300, function () {
          event_location_map.invalidateSize();
        });
        $("#next-step").fadeIn(300, function () {});
        $("#event-radius").fadeIn(300, function () {});
        $("#radius-number").fadeIn(300, function () {});
      });
      choice_dehighlight("yes-location-restriction");
      template_status = "0010000";
    } else if (question_choice === "no-location-restriction") {
      $("#poll-template-location-restriction").fadeOut(300, function () {});
      $("#warning-no-location-restriction-choice").fadeOut(300, function () {});
      $("#next-step").fadeOut(300, function () {
        $("#post-category-container").fadeIn(300, function () {});
        $("#next-step").fadeIn(300, function () {});
        choice_dehighlight("no-location-restriction");
        template_status = "0100000";
      });
    }
  } else if (template_status === "0010000") {
    if (event_coordinates.length < 2) {
      $("#warning-no-location-selected").fadeIn(300, function () {});
    } else {
      $("#warning-no-location-selected").fadeOut(300, function () {});
      $("#warning-radius-too-small").fadeOut(300, function () {});
      $("#location-choice").fadeOut(300, function () {});
      $("#next-step").fadeOut(300, function () {
        $("#post-category-container").fadeIn(300, function () {});
        $("#next-step").fadeIn(300, function () {});
        template_status = "0100000";
      });
    }
  } else if (template_status === "0100000") {
    if (post_category === "0") {
      $("#warning-no-category-selected").fadeIn(300, function () {});
    } else {
      $("#warning-no-category-selected").fadeOut(300, function () {});
      $("#post-category-container").fadeOut(300, function () {});
      $("#next-step").fadeOut(300, function () {
        document.getElementById("next-step").innerText = "Post Poll";
      });
      $("#next-step")
        .promise()
        .done(function () {
          $("#next-step").fadeIn(300, function () {});
          $("#poll-question").fadeIn(300, function () {});
          template_status = "1000000";
        });
    }
  } else if (template_status === "1000000") {
    let question_text = document.forms["poll-question"]["question-text"].value;
    if ($("#question").val().trim().length < 15) {
      $("#warning-empty-text-area").fadeIn(300, function () {});
    } else if (user_choice !== "none" && $("#question").val().trim().length >= 1) {
      document.getElementById("next-step").disabled = true;
      if (time_limit !== "") {
        time_limit = time_limit + ":00";
      }
      fetch("process_data.php", {
        method: "POST",
        body: JSON.stringify({
          request: "upload_post_data",
          question: question_text,
          poll_choices_options: poll_choices,
          poll_choice: user_choice,
          time_limiter: time_limit,
          event_lat: event_coordinates[0],
          event_long: event_coordinates[1],
          event_rad: event_radius,
          post_category: parseInt(post_category),
        }),
      })
        .then((res) => res.json())
        .then((response) => {
          conn.send(JSON.stringify(["new_post_added", response]));
          $("#warning-empty-text-area").fadeOut(300, function () {});
          $("#poll-question").fadeOut(300, function () {});
          $("#next-step").fadeOut(300, function () {
            document.getElementById("next-step").innerText = "Next";
            $("#all-filters").fadeIn(300, function () {});
            $("#add-post-icon").fadeIn(300, function () {});
            null_all_styles();
            generate_posts(false);
          });
        });
    }
  }
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

document.getElementById("yes-time-limit").addEventListener("click", function () {
  choice_highlight_binary("yes-time-limit", "no-time-limit");
});

document.getElementById("no-time-limit").addEventListener("click", function () {
  choice_highlight_binary("no-time-limit", "yes-time-limit");
});

document.getElementById("yes-location-restriction").addEventListener("click", function () {
  choice_highlight_binary("yes-location-restriction", "no-location-restriction");
});

document.getElementById("no-location-restriction").addEventListener("click", function () {
  choice_highlight_binary("no-location-restriction", "yes-location-restriction");
});

function choice_highlight(choice, dehigh1, dehigh2, dehigh3) {
  choice_dehighlight(dehigh1);
  choice_dehighlight(dehigh2);
  choice_dehighlight(dehigh3);
  document.getElementById(choice).style.border = "0.1em solid #cc0000";
  document.getElementById(choice).style.color = "#cc0000";
  user_choice = choice;
}

function choice_highlight_binary(choice, dehigh1) {
  choice_dehighlight(dehigh1);
  document.getElementById(choice).style.border = "0.1em solid #cc0000";
  document.getElementById(choice).style.color = "#cc0000";
  question_choice = choice;
}

function choice_dehighlight(choice) {
  document.getElementById(choice).style.border = null;
  document.getElementById(choice).style.color = null;
}

//This generates the posts on the home page.
export function generate_posts(bookmark_filter, filter_hot, filter_preferred_categories, filter_filter, filter_search, user_search, radius_filter) {
  fetch("process_data.php", {
    method: "POST",
    body: JSON.stringify({
      request: "get_post_data",
      bookmarks_only: bookmark_filter,
      filter_hot: filter_hot,
      filter_preferred_categories: filter_preferred_categories,
      filter_filter: filter_filter,
      filter_search: filter_search,
      user_search: user_search,
      radius_filter: radius_filter,
    }),
  })
    .then((res) => res.json())
    .then((response) => {
      post_data.length = 0;
      user_chevron_vote.length = 0;
      user_yes_no_vote.length = 0;
      post_data = response;
      let post_time;
      for (let i = 0; i < post_data.length; i++) {
        post_time = DateTime.fromFormat(post_data[i][6], "yyyy-MM-dd HH:mm:ss").toRelative();
        post_data[i][6] = DateTime.fromFormat(post_data[i][6], "yyyy-MM-dd HH:mm:ss").toFormat("cccc, dd MMMM, yyyy, TTTT");
        if (i == 0) {
          document.getElementsByClassName("post-user-name")[0].innerText = post_data[i][1];
          document.getElementsByClassName("post-question")[0].innerText = post_data[i][4];
          document.getElementsByClassName("score")[0].innerText = post_data[i][5];
          document.getElementsByClassName("post-time")[0].innerText = post_time;
          document.getElementsByClassName("post-time-detailed")[0].innerText = post_data[i][6];

          if (post_data[i][2] == 2 && post_data[0].length > 14) {
            for (let j = 17; j < 22; j++) {
              let star_range = (j - 16) * 10;
              let max_star_position = star_range - 10;
              let star_limit;
              if (post_data[i][j + 5] !== null) {
                star_limit = parseInt(post_data[i][j + 5] * 2.0) + max_star_position;
              }
              if (post_data[i][j] !== null) {
                if (j !== 17) {
                  let clone_rating_choices = document.getElementsByClassName("post")[0].getElementsByClassName("rating-choices")[0];
                  let clone = clone_rating_choices.cloneNode(true);
                  clone.setAttribute("data-value", j - 16);
                  document
                    .getElementsByClassName("post")[0]
                    .getElementsByClassName("rating-vote")[0]
                    .insertBefore(
                      clone,
                      document
                        .getElementsByClassName("post")[0]
                        .getElementsByClassName("rating-vote")[0]
                        .getElementsByClassName("send-rating-button")[0]
                    );
                  document
                    .getElementsByClassName("post")[0]
                    .querySelectorAll(".rating-choices")
                    [j - 17].querySelectorAll(".half-star-container")
                    .forEach((half_star) => (half_star.style.color = "#f3f3f3"));
                  document
                    .getElementsByClassName("post")[0]
                    .querySelectorAll(".rating-choices")
                    [j - 17].getElementsByClassName("choice-name")[0].innerText = post_data[i][j];
                } else {
                  document
                    .getElementsByClassName("post")[0]
                    .querySelectorAll(".rating-choices")
                    [j - 17].querySelectorAll(".half-star-container")
                    .forEach((half_star) => (half_star.style.color = "#f3f3f3"));
                  document
                    .getElementsByClassName("post")[0]
                    .querySelectorAll(".rating-choices")
                    [j - 17].getElementsByClassName("choice-name")[0].innerText = post_data[i][j];
                }
                if (post_data[i][j + 5] !== null) {
                  for (let k = max_star_position; k < star_limit; k++) {
                    document.getElementsByClassName("post")[0].getElementsByClassName("half-star-container")[k].style.color = "#00ffd0";
                  }
                }
              }
            }
          } else if (post_data[i][2] == 3 && post_data[0].length > 14) {
            for (let j = 17; j < 22; j++) {
              if (post_data[i][j] !== null) {
                if (j > 19) {
                  let clone_approval_choices = document.getElementsByClassName("post")[0].getElementsByClassName("approval-choice")[0];
                  let clone = clone_approval_choices.cloneNode(true);
                  clone.setAttribute("value", j - 16);
                  document.getElementsByClassName("post")[0].getElementsByClassName("approval-choices-container")[0].appendChild(clone);
                  document
                    .getElementsByClassName("post")[0]
                    .querySelectorAll(".approval-choices-container")[0]
                    .getElementsByClassName("approval-choice")[j - 17].innerText = post_data[i][j];
                } else if (j <= 19) {
                  document
                    .getElementsByClassName("post")[0]
                    .querySelectorAll(".approval-choices-container")[0]
                    .getElementsByClassName("approval-choice")[j - 17].innerText = post_data[i][j];
                }
                if (post_data[i][j + 10] === "1") {
                  document.getElementsByClassName("post")[0].getElementsByClassName("approval-choice")[j - 17].style.border = "0.1em solid #cc0000";
                  document.getElementsByClassName("post")[0].getElementsByClassName("approval-choice")[j - 17].style.color = "#cc0000";
                } else if (post_data[i][j + 10] === "0") {
                  document.getElementsByClassName("post")[0].getElementsByClassName("approval-choice")[j - 17].style.border = "0.1em solid #1a1a1b";
                  document.getElementsByClassName("post")[0].getElementsByClassName("approval-choice")[j - 17].style.color = "#f3f3f3";
                }
              }
            }
          }
        } else if (i > 0) {
          node[i - 1] = document.getElementsByClassName("post")[0];
          clone[i - 1] = node[i - 1].cloneNode(true);
          clone[i - 1].querySelectorAll(".post-user-name")[0].innerText = post_data[i][1];
          clone[i - 1].querySelectorAll(".post-question")[0].innerText = post_data[i][4];
          clone[i - 1].querySelectorAll(".score")[0].innerText = post_data[i][5];
          clone[i - 1].querySelectorAll(".post-time")[0].innerText = post_time;
          clone[i - 1].querySelectorAll(".post-time-detailed")[0].innerText = post_data[i][6];
          document.getElementById("posts-container").appendChild(clone[i - 1]);

          if (post_data[i][2] == 2 && post_data[0].length > 14) {
            clone[i - 1].querySelectorAll(".rating-choices").forEach((child) => {
              if (child.getAttribute("data-value") !== "1") {
                child.remove();
              }
            });
            for (let j = 17; j < 22; j++) {
              let star_range = (j - 16) * 10;
              let max_star_position = star_range - 10;
              let star_limit;
              if (post_data[i][j + 5] !== null) {
                star_limit = parseInt(post_data[i][j + 5] * 2.0) + max_star_position;
              }

              if (post_data[i][j] !== null) {
                if (j !== 17) {
                  let clone_rating_choices = clone[i - 1].getElementsByClassName("rating-choices")[0];
                  let clone_choices = clone_rating_choices.cloneNode(true);
                  clone_choices.setAttribute("data-value", j - 16);
                  clone[i - 1]
                    .getElementsByClassName("rating-vote")[0]
                    .insertBefore(
                      clone_choices,
                      clone[i - 1].getElementsByClassName("rating-vote")[0].getElementsByClassName("send-rating-button")[0]
                    );
                  clone[i - 1]
                    .querySelectorAll(".rating-choices")
                    [j - 17].querySelectorAll(".half-star-container")
                    .forEach((half_star) => (half_star.style.color = "#f3f3f3"));
                  clone[i - 1].querySelectorAll(".rating-choices")[j - 17].getElementsByClassName("choice-name")[0].innerText = post_data[i][j];
                } else {
                  clone[i - 1].querySelectorAll(".rating-choices")[j - 17].getElementsByClassName("choice-name")[0].innerText = post_data[i][j];
                }
                if (post_data[i][j + 5] !== null) {
                  for (let k = max_star_position; k < star_limit; k++) {
                    clone[i - 1].getElementsByClassName("half-star-container")[k].style.color = "#00ffd0";
                  }
                }
              }
            }
          } else if (post_data[i][2] == 3 && post_data[0].length > 14) {
            clone[i - 1].querySelectorAll(".approval-choice").forEach((child) => {
              if (child.getAttribute("value") !== "1" && child.getAttribute("value") !== "2" && child.getAttribute("value") !== "3") {
                child.remove();
              }
            });
            for (let j = 17; j < 22; j++) {
              if (post_data[i][j] !== null) {
                if (j > 19) {
                  let clone_approval_choices = document.getElementsByClassName("post")[i].getElementsByClassName("approval-choice")[0];
                  let clone = clone_approval_choices.cloneNode(true);
                  clone.setAttribute("value", j - 16);
                  document.getElementsByClassName("post")[i].getElementsByClassName("approval-choices-container")[0].appendChild(clone);
                  document
                    .getElementsByClassName("post")
                    [i].querySelectorAll(".approval-choices-container")[0]
                    .getElementsByClassName("approval-choice")[j - 17].innerText = post_data[i][j];
                } else if (j <= 19) {
                  document
                    .getElementsByClassName("post")
                    [i].querySelectorAll(".approval-choices-container")[0]
                    .getElementsByClassName("approval-choice")[j - 17].innerText = post_data[i][j];
                }
                if (post_data[i][j + 10] === "1") {
                  document.getElementsByClassName("post")[i].getElementsByClassName("approval-choice")[j - 17].style.border = "0.1em solid #cc0000";
                  document.getElementsByClassName("post")[i].getElementsByClassName("approval-choice")[j - 17].style.color = "#cc0000";
                } else if (post_data[i][j + 10] === "0") {
                  document.getElementsByClassName("post")[i].getElementsByClassName("approval-choice")[j - 17].style.border = "0.1em solid #1a1a1b";
                  document.getElementsByClassName("post")[i].getElementsByClassName("approval-choice")[j - 17].style.color = "#f3f3f3";
                }
              }
            }
          }
        }
      }
      if (post_time !== undefined && post_time !== null) {
        if (post_data[0].length > 14) {
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
            if (post_data[i][2] == 1) {
              let new_yes_button = document.createElement("button");
              new_yes_button.className = "answer-yes";
              document
                .getElementsByClassName("user-question-answers")
                [i].insertBefore(new_yes_button, document.getElementsByClassName("show-results")[i]);
              new_yes_button.setAttribute("data-dir", "yes");
              new_yes_button.innerText = "Yes";

              let new_no_button = document.createElement("button");
              new_no_button.className = "answer-no";
              document
                .getElementsByClassName("user-question-answers")
                [i].insertBefore(new_no_button, document.getElementsByClassName("show-results")[i]);
              new_no_button.setAttribute("data-dir", "no");
              new_no_button.innerText = "No";
              if (post_data[i][8] == 1) {
                new_yes_button.style.background = "#00ffd0";
                user_yes_no_vote.push([true, false]);
              } else if (post_data[i][9] == 1) {
                new_no_button.style.background = "#cc0000";
                user_yes_no_vote.push([false, true]);
              } else if (post_data[i][8] == 0 && post_data[i][9] == 0) {
                user_yes_no_vote.push([false, false]);
              }
            } else if (post_data[i][2] == 2 || post_data[i][2] == 3 || post_data[i][2] == 4) {
              user_yes_no_vote.push([false, false]);
              let new_vote_button = document.createElement("button");
              new_vote_button.className = "vote";
              document
                .getElementsByClassName("user-question-answers")
                [i].insertBefore(new_vote_button, document.getElementsByClassName("show-results")[i]);
              new_vote_button.setAttribute("data-dir", "vote");
              new_vote_button.innerText = "Vote";
            }
            if (post_data[i][10] == 1) {
              let new_bookmark = document.createElement("i");
              new_bookmark.className = "fa-solid fa-bookmark";
              document.getElementsByClassName("parent_of_bookmark")[i].appendChild(new_bookmark);
              document.getElementsByClassName("parent_of_bookmark")[i].children[0].style.color = "#98d9ff";
            } else if (post_data[i][10] == 0) {
              let new_bookmark = document.createElement("i");
              new_bookmark.className = "fa-regular fa-bookmark";
              document.getElementsByClassName("parent_of_bookmark")[i].appendChild(new_bookmark);
            }
            if (post_data[i][11] !== null && DateTime.fromFormat(post_data[i][11], "yyyy-MM-dd HH:mm:ss").toRelative().search("ago") === -1) {
              document.querySelectorAll(".poll-remaining-time")[i].innerText =
                "Poll closes " + DateTime.fromFormat(post_data[i][11], "yyyy-MM-dd HH:mm:ss").toRelative();
              document.querySelectorAll(".poll-timer-container")[i].style.display = "flex";
              document.querySelectorAll(".fa-clock")[i].style.color = "#00ffd0";
            } else if (post_data[i][11] !== null && DateTime.fromFormat(post_data[i][11], "yyyy-MM-dd HH:mm:ss").toRelative().search("ago") !== -1) {
              document.querySelectorAll(".poll-remaining-time")[i].innerText =
                "Poll closed " + DateTime.fromFormat(post_data[i][11], "yyyy-MM-dd HH:mm:ss").toRelative();
              document.querySelectorAll(".poll-timer-container")[i].style.display = "flex";
              document.querySelectorAll(".poll-timer-container")[i].style.color = "#cc0000";
            }
            if (post_data[i][15] > 0 && post_data[i][2] == 1) {
              let new_check = document.createElement("i");
              new_check.className = "fa-solid fa-thumbs-up";
              document.getElementsByClassName("parent_of_check_yes_no")[i].appendChild(new_check);
              document.getElementsByClassName("parent_of_check_yes_no")[i].children[0].style.color = "#00ffd0";
            } else if (post_data[i][15] < 0 && post_data[i][2] == 1) {
              let new_check = document.createElement("i");
              new_check.className = "fa-solid fa-thumbs-down";
              document.getElementsByClassName("parent_of_check_yes_no")[i].appendChild(new_check);
              document.getElementsByClassName("parent_of_check_yes_no")[i].children[0].style.color = "#cc0000";
            } else if (post_data[i][15] == 0 && post_data[i][2] == 1) {
              let new_check = document.createElement("i");
              new_check.className = "fa-solid fa-question";
              document.getElementsByClassName("parent_of_check_yes_no")[i].appendChild(new_check);
              document.getElementsByClassName("parent_of_check_yes_no")[i].children[0].style.color = "#b5b5b5";
            }
            let new_canvas = document.createElement("canvas");
            new_canvas.className = "myChart";
            document.getElementsByClassName("chartCard")[i].appendChild(new_canvas);
          }
        } else if (post_data[0].length <= 14) {
          for (let i = 0; i < post_data.length; i++) {
            let new_bookmark = document.createElement("i");
            new_bookmark.className = "fa-regular fa-bookmark";
            document.getElementsByClassName("parent_of_bookmark")[i].appendChild(new_bookmark);
            let new_canvas = document.createElement("canvas");
            new_canvas.className = "myChart";
            document.getElementsByClassName("chartCard")[i].appendChild(new_canvas);
            if (post_data[i][2] == 1) {
              let new_yes_button = document.createElement("button");
              new_yes_button.className = "answer-yes";
              document
                .getElementsByClassName("user-question-answers")
                [i].insertBefore(new_yes_button, document.getElementsByClassName("show-results")[i]);
              new_yes_button.setAttribute("data-dir", "yes");
              new_yes_button.innerText = "Yes";

              let new_no_button = document.createElement("button");
              new_no_button.className = "answer-no";
              document
                .getElementsByClassName("user-question-answers")
                [i].insertBefore(new_no_button, document.getElementsByClassName("show-results")[i]);
              new_no_button.setAttribute("data-dir", "no");
              new_no_button.innerText = "No";
            } else if (post_data[i][2] == 2 || post_data[i][2] == 3 || post_data[i][2] == 4) {
              user_yes_no_vote.push([false, false]);
              let new_vote_button = document.createElement("button");
              new_vote_button.className = "vote";
              document
                .getElementsByClassName("user-question-answers")
                [i].insertBefore(new_vote_button, document.getElementsByClassName("show-results")[i]);
              new_vote_button.setAttribute("data-dir", "vote");
              new_vote_button.innerText = "Vote";
            }
            if (post_data[i][7] !== null && DateTime.fromFormat(post_data[i][7], "yyyy-MM-dd HH:mm:ss").toRelative().search("ago") === -1) {
              document.querySelectorAll(".poll-remaining-time")[i].innerText =
                "Poll closes " + DateTime.fromFormat(post_data[i][7], "yyyy-MM-dd HH:mm:ss").toRelative();
              document.querySelectorAll(".poll-timer-container")[i].style.display = "flex";
              document.querySelectorAll(".fa-clock")[i].style.color = "#00ffd0";
            } else if (post_data[i][7] !== null && DateTime.fromFormat(post_data[i][7], "yyyy-MM-dd HH:mm:ss").toRelative().search("ago") !== -1) {
              document.querySelectorAll(".poll-remaining-time")[i].innerText =
                "Poll closed " + DateTime.fromFormat(post_data[i][7], "yyyy-MM-dd HH:mm:ss").toRelative();
              document.querySelectorAll(".poll-timer-container")[i].style.display = "flex";
              document.querySelectorAll(".poll-timer-container")[i].style.color = "#cc0000";
            }
            if (post_data[i][8] > 0 && post_data[i][2] == 1) {
              let new_check = document.createElement("i");
              new_check.className = "fa-solid fa-thumbs-up";
              document.getElementsByClassName("parent_of_check_yes_no")[i].appendChild(new_check);
              document.getElementsByClassName("parent_of_check_yes_no")[i].children[0].style.color = "#00ffd0";
            } else if (post_data[i][8] < 0 && post_data[i][2] == 1) {
              let new_check = document.createElement("i");
              new_check.className = "fa-solid fa-thumbs-down";
              document.getElementsByClassName("parent_of_check_yes_no")[i].appendChild(new_check);
              document.getElementsByClassName("parent_of_check_yes_no")[i].children[0].style.color = "#cc0000";
            } else if (post_data[i][8] == 0 && post_data[i][2] == 1) {
              let new_check = document.createElement("i");
              new_check.className = "fa-solid fa-question";
              document.getElementsByClassName("parent_of_check_yes_no")[i].appendChild(new_check);
              document.getElementsByClassName("parent_of_check_yes_no")[i].children[0].style.color = "#b5b5b5";
            }
          }
        }
        $("#add-post-icon").fadeIn(300, function () {});
        $("#all-filters").fadeIn(300, function () {});
        $(".post").fadeIn(300, function () {});
        if (
          window.getComputedStyle(document.getElementsByClassName("fa-fire-flame-curved")[0]).backgroundClip !== "text" &&
          window.getComputedStyle(document.getElementsByClassName("fa-table-list")[0]).backgroundClip !== "text" &&
          (document.forms["search-box-container"]["search-text"].value === "" ||
            document.forms["search-box-container"]["search-text"].value === undefined) &&
          window.getComputedStyle(document.getElementsByClassName("fa-filter")[0]).backgroundClip !== "text"
        ) {
          clear_bell_counter();
        }
      } else {
        $("#add-post-icon").fadeIn(300, function () {});
        $("#all-filters").fadeIn(300, function () {});
      }
      console.log(post_data);
    });
}

const postContainer = document.querySelector("#posts-container");

//This determines which post the user clicked to change its data.
postContainer.addEventListener(
  "click",
  (e) => {
    const btn_up = e.target.closest('button[data-dir="up"]');
    const btn_down = e.target.closest('button[data-dir="down"]');
    const btn_yes = e.target.closest('button[data-dir="yes"]');
    const btn_no = e.target.closest('button[data-dir="no"]');
    const btn_show_results = e.target.closest('button[data-dir="show-results"]');
    const btn_bookmark = e.target.closest('button[data-dir="bookmark"]');
    const btn_user_name = e.target.closest(".post-user-name");
    const btn_vote = e.target.closest('button[data-dir="vote"]');
    const btn_star = e.target.closest('button[data-dir="star"]');
    const btn_star_vote = e.target.closest('button[data-dir="star-vote"]');
    const btn_approval_send = e.target.closest('button[data-dir="approval-vote-send"]');
    const btn_approval_vote = e.target.closest('div[data-dir="approval-vote"]');

    if (btn_vote) {
      const post_vote = btn_vote.closest(".post");
      const postIndexVote = [...postContainer.children].indexOf(post_vote);
      if (post_data[0].length > 14) {
        if (
          post_data[postIndexVote][11] !== null &&
          DateTime.fromFormat(post_data[postIndexVote][11], "yyyy-MM-dd HH:mm:ss").toRelative().search("ago") !== -1
        ) {
          $("#notification-container").fadeIn(300, function () {});
          document.getElementById("notification-text").innerText = "Poll is closed";
        } else if (
          post_data[postIndexVote][12] !== null &&
          calcCrow(user_coordinates[0], user_coordinates[1], parseFloat(post_data[postIndexVote][12]), parseFloat(post_data[postIndexVote][13])) >
            parseInt(post_data[postIndexVote][14])
        ) {
          $("#notification-container").fadeIn(300, function () {});
          document.getElementById("notification-text").innerText = "You aren't allowed to vote in this post because you are outside the event radius";
        } else {
          if (post_data[postIndexVote][2] == "2") {
            if (window.getComputedStyle(document.getElementsByClassName("rating-vote")[postIndexVote]).display === "flex") {
              document.querySelectorAll(".post")[postIndexVote].getElementsByClassName("vote")[0].style.backgroundColor = null;
              document.querySelectorAll(".post")[postIndexVote].getElementsByClassName("rating-vote")[0].style.display = "none";
            } else {
              if (window.getComputedStyle(document.getElementsByClassName("rating-vote-results")[postIndexVote]).display === "flex") {
                document.querySelectorAll(".show-results")[postIndexVote].style.backgroundColor = "#00a1ff80";
                document.querySelectorAll(".rating-vote-results")[postIndexVote].style.display = "none";
              }
              document.querySelectorAll(".post")[postIndexVote].getElementsByClassName("vote")[0].style.backgroundColor = "#00ffd0";
              document.querySelectorAll(".post")[postIndexVote].getElementsByClassName("rating-vote")[0].style.display = "flex";
            }
          } else if (post_data[postIndexVote][2] == "3") {
            if (window.getComputedStyle(document.getElementsByClassName("approval-vote-container")[postIndexVote]).display === "flex") {
              document.querySelectorAll(".post")[postIndexVote].getElementsByClassName("vote")[0].style.backgroundColor = null;
              document.querySelectorAll(".post")[postIndexVote].getElementsByClassName("approval-vote-container")[0].style.display = "none";
            } else {
              if (window.getComputedStyle(document.getElementsByClassName("approval-vote-results")[postIndexVote]).display === "flex") {
                document.querySelectorAll(".show-results")[postIndexVote].style.backgroundColor = "#00a1ff80";
                document.querySelectorAll(".approval-vote-results")[postIndexVote].style.display = "none";
              }
              document.querySelectorAll(".post")[postIndexVote].getElementsByClassName("vote")[0].style.backgroundColor = "#00ffd0";
              document.querySelectorAll(".post")[postIndexVote].getElementsByClassName("approval-vote-container")[0].style.display = "flex";
              for (
                let i = 0;
                i < document.querySelectorAll(".post")[postIndexVote].getElementsByClassName("approval-choices-container")[0].children.length;
                i++
              ) {
                if (post_data[postIndexVote][i + 27] === "0") {
                  document.getElementsByClassName("post")[postIndexVote].getElementsByClassName("approval-choice")[i].style.border =
                    "0.1em solid #1a1a1b";
                  document.getElementsByClassName("post")[postIndexVote].getElementsByClassName("approval-choice")[i].style.color = "#f3f3f3";
                } else if (post_data[postIndexVote][i + 27] === "1") {
                  document.getElementsByClassName("post")[postIndexVote].getElementsByClassName("approval-choice")[i].style.border =
                    "0.1em solid #cc0000";
                  document.getElementsByClassName("post")[postIndexVote].getElementsByClassName("approval-choice")[i].style.color = "#cc0000";
                }
              }
            }
          }
        }
      } else {
        $("#notification-container").fadeIn(300, function () {});
        document.getElementById("notification-text").innerText = "You have to be logged-in to vote";
      }
    } else if (btn_show_results) {
      const post_show_results = btn_show_results.closest(".post");
      const postIndexShowResults = [...postContainer.children].indexOf(post_show_results);

      if (post_data[postIndexShowResults][2] == 1)
        if (window.getComputedStyle(document.getElementsByClassName("myChart")[postIndexShowResults]).display === "block") {
          document.querySelectorAll(".show-results")[postIndexShowResults].style.backgroundColor = "#00a1ff80";
          document.querySelectorAll(".chartCard")[postIndexShowResults].style.display = "none";
          if (myChart[postIndexShowResults]) {
            myChart[postIndexShowResults].destroy();
          }
        } else {
          document.querySelectorAll(".show-results")[postIndexShowResults].style.backgroundColor = "#00a1ff";
          get_yes_no_data(postIndexShowResults);
        }
      else if (post_data[postIndexShowResults][2] == 2) {
        if (window.getComputedStyle(document.getElementsByClassName("rating-vote-results")[postIndexShowResults]).display === "flex") {
          document.querySelectorAll(".show-results")[postIndexShowResults].style.backgroundColor = "#00a1ff80";
          document.querySelectorAll(".rating-vote-results")[postIndexShowResults].style.display = "none";
        } else {
          if (window.getComputedStyle(document.getElementsByClassName("rating-vote")[postIndexShowResults]).display === "flex") {
            document.querySelectorAll(".post")[postIndexShowResults].getElementsByClassName("vote")[0].style.backgroundColor = null;
            document.querySelectorAll(".rating-vote")[postIndexShowResults].style.display = "none";
          }
          document.querySelectorAll(".show-results")[postIndexShowResults].style.backgroundColor = "#00a1ff";
          document.querySelectorAll(".rating-vote-results")[postIndexShowResults].style.display = "flex";
          get_rating_data(postIndexShowResults);
        }
      } else if (post_data[postIndexShowResults][2] == 3) {
        if (window.getComputedStyle(document.getElementsByClassName("approval-vote-results")[postIndexShowResults]).display === "flex") {
          document.querySelectorAll(".show-results")[postIndexShowResults].style.backgroundColor = "#00a1ff80";
          document.querySelectorAll(".approval-vote-results")[postIndexShowResults].style.display = "none";
        } else {
          if (window.getComputedStyle(document.getElementsByClassName("approval-vote-container")[postIndexShowResults]).display === "flex") {
            document.querySelectorAll(".post")[postIndexShowResults].getElementsByClassName("vote")[0].style.backgroundColor = null;
            document.querySelectorAll(".approval-vote-container")[postIndexShowResults].style.display = "none";
          }
          document.querySelectorAll(".show-results")[postIndexShowResults].style.backgroundColor = "#00a1ff";
          document.querySelectorAll(".approval-vote-results")[postIndexShowResults].style.display = "flex";
          get_approval_data(postIndexShowResults);
        }
      }
    } else if (btn_user_name) {
      const post_user_name = btn_user_name.closest(".post");
      const postIndexPostUserName = [...postContainer.children].indexOf(post_user_name);

      specific_user_posts = post_data[postIndexPostUserName][1];
      clear_filters();
      $(".post").fadeOut(300, function () {});
      $(".post")
        .promise()
        .done(function () {
          $(".post").not(":first").remove();
          bookmarks_active = false;
          reset_poll_data();
          null_all_styles();
          generate_posts(false, null, null, null, null, post_data[postIndexPostUserName][1], null);
        });
    }
    if (post_data[0].length > 14) {
      if (btn_approval_vote) {
        const post_approval_vote = btn_approval_vote.closest(".post");
        const postAprovalVote = [...postContainer.children].indexOf(post_approval_vote);

        if (
          post_data[postAprovalVote][11] !== null &&
          DateTime.fromFormat(post_data[postAprovalVote][11], "yyyy-MM-dd HH:mm:ss").toRelative().search("ago") !== -1
        ) {
          $("#notification-container").fadeIn(300, function () {});
          document.getElementById("notification-text").innerText = "Poll is closed";
        } else if (
          post_data[postAprovalVote][12] !== null &&
          calcCrow(user_coordinates[0], user_coordinates[1], parseFloat(post_data[postAprovalVote][12]), parseFloat(post_data[postAprovalVote][13])) >
            parseInt(post_data[postAprovalVote][14])
        ) {
          $("#notification-container").fadeIn(300, function () {});
          document.getElementById("notification-text").innerText = "You aren't allowed to vote in this post because you are outside the event radius";
        } else {
          if (window.getComputedStyle(btn_approval_vote).color === "rgb(204, 0, 0)") {
            btn_approval_vote.style.border = null;
            btn_approval_vote.style.color = null;
          } else {
            btn_approval_vote.style.border = "0.1em solid #cc0000";
            btn_approval_vote.style.color = "#cc0000";
          }
        }
      } else if (btn_approval_send) {
        const post_approval_send = btn_approval_send.closest(".post");
        const postIndexApprovalSend = [...postContainer.children].indexOf(post_approval_send);
        let votes = [];
        for (let i = 17; i < 22; i++) {
          if (
            post_data[postIndexApprovalSend][i] !== null &&
            window.getComputedStyle(
              document.getElementsByClassName("approval-choices-container")[postIndexApprovalSend].getElementsByClassName("approval-choice")[i - 17]
            ).color === "rgb(204, 0, 0)"
          ) {
            votes.push(1);
            post_data[postIndexApprovalSend][i + 10] = "1";
          } else if (post_data[postIndexApprovalSend][i] !== null) {
            votes.push(0);
            post_data[postIndexApprovalSend][i + 10] = "0";
          } else {
            votes.push(null);
          }
        }
        fetch("process_data.php", {
          method: "POST",
          body: JSON.stringify({ request: "approval_vote", votes: votes, post_id: post_data[postIndexApprovalSend][0] }),
        })
          .then((res) => res.json())
          .then((response) => {
            if (response[10].trim() == "Success") {
              conn.send(
                JSON.stringify([
                  "approval_vote",
                  post_data[postIndexApprovalSend][0],
                  post_data[0][16],
                  response[0],
                  response[1],
                  response[2],
                  response[3],
                  response[4],
                  response[5],
                  response[6],
                  response[7],
                  response[8],
                  response[9],
                ])
              );
              $("#notification-container").fadeIn(300, function () {});
              document.getElementById("notification-text").innerText = "Vote Accepted\n\n You can change your vote by voting again";
            }
          });
      } else if (btn_star) {
        const post_star = btn_star.closest(".post");
        const postIndexStar = [...postContainer.children].indexOf(post_star);
        if (
          post_data[postIndexStar][11] !== null &&
          DateTime.fromFormat(post_data[postIndexStar][11], "yyyy-MM-dd HH:mm:ss").toRelative().search("ago") !== -1
        ) {
          $("#notification-container").fadeIn(300, function () {});
          document.getElementById("notification-text").innerText = "Poll is closed";
        } else if (
          post_data[postIndexStar][12] !== null &&
          calcCrow(user_coordinates[0], user_coordinates[1], parseFloat(post_data[postIndexStar][12]), parseFloat(post_data[postIndexStar][13])) >
            parseInt(post_data[postIndexStar][14])
        ) {
          $("#notification-container").fadeIn(300, function () {});
          document.getElementById("notification-text").innerText = "You aren't allowed to vote in this post because you are outside the event radius";
        } else {
          const rating_choice = btn_star.closest(".rating-choices").getAttribute("data-value");

          let star_range = rating_choice * 10;
          let max_star_position;
          max_star_position = star_range - 10;

          let post_index = document.querySelectorAll(".post")[postIndexStar];

          for (let i = max_star_position; i < parseInt(parseFloat(btn_star.value) * 2.0) + max_star_position; i++) {
            post_index.getElementsByClassName("half-star-container")[i].style.color = "#00ffd0";
          }

          let temp_pos = parseInt(rating_choice) + 21;
          post_data[postIndexStar][temp_pos] = parseFloat(btn_star.value);
        }
      } else if (btn_star_vote) {
        const post_star_vote = btn_star_vote.closest(".post");
        const postIndexPostStarVote = [...postContainer.children].indexOf(post_star_vote);

        if (
          post_data[postIndexPostStarVote][11] !== null &&
          DateTime.fromFormat(post_data[postIndexPostStarVote][11], "yyyy-MM-dd HH:mm:ss").toRelative().search("ago") !== -1
        ) {
          $("#notification-container").fadeIn(300, function () {});
          document.getElementById("notification-text").innerText = "Poll is closed";
        } else if (
          post_data[postIndexPostStarVote][12] !== null &&
          calcCrow(
            user_coordinates[0],
            user_coordinates[1],
            parseFloat(post_data[postIndexPostStarVote][12]),
            parseFloat(post_data[postIndexPostStarVote][13])
          ) > parseInt(post_data[postIndexPostStarVote][14])
        ) {
          $("#notification-container").fadeIn(300, function () {});
          document.getElementById("notification-text").innerText = "You aren't allowed to vote in this post because you are outside the event radius";
        } else {
          let votes = [];
          for (let i = 17; i < 22; i++) {
            if (post_data[postIndexPostStarVote][i] !== null) {
              votes.push(post_data[postIndexPostStarVote][i + 5]);
            } else {
              votes.push(null);
            }
          }
          fetch("process_data.php", {
            method: "POST",
            body: JSON.stringify({ request: "rating_vote", votes: votes, post_id: post_data[postIndexPostStarVote][0] }),
          })
            .then((res) => res.json())
            .then((response) => {
              if (response[10].trim() == "Success") {
                conn.send(
                  JSON.stringify([
                    "rating_vote",
                    post_data[postIndexPostStarVote][0],
                    post_data[0][16],
                    response[0],
                    response[1],
                    response[2],
                    response[3],
                    response[4],
                    response[5],
                    response[6],
                    response[7],
                    response[8],
                    response[9],
                  ])
                );
                $("#notification-container").fadeIn(300, function () {});
                document.getElementById("notification-text").innerText = "Vote Accepted\n\n You can change your vote by voting again";
              }
            });
        }
      } else if (btn_up) {
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
                conn.send(JSON.stringify(["chevron_vote_up_up", post_data[postIndexUP][0], post_data[0][16]]));
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
                conn.send(JSON.stringify(["chevron_vote_up_down", post_data[postIndexUP][0], post_data[0][16]]));
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
                conn.send(JSON.stringify(["chevron_vote_up_no", post_data[postIndexUP][0], post_data[0][16]]));
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
                conn.send(JSON.stringify(["chevron_vote_down_down", post_data[postIndexDown][0], post_data[0][16]]));
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
                conn.send(JSON.stringify(["chevron_vote_down_up", post_data[postIndexDown][0], post_data[0][16]]));
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
                conn.send(JSON.stringify(["chevron_vote_down_no", post_data[postIndexDown][0], post_data[0][16]]));
              }
            });
        }
      } else if (btn_yes) {
        const post_yes = btn_yes.closest(".post");
        const postIndexYes = [...postContainer.children].indexOf(post_yes);
        if (
          post_data[postIndexYes][11] !== null &&
          DateTime.fromFormat(post_data[postIndexYes][11], "yyyy-MM-dd HH:mm:ss").toRelative().search("ago") !== -1
        ) {
          $("#notification-container").fadeIn(300, function () {});
          document.getElementById("notification-text").innerText = "Poll is closed";
        } else if (
          post_data[postIndexYes][12] !== null &&
          calcCrow(user_coordinates[0], user_coordinates[1], parseFloat(post_data[postIndexYes][12]), parseFloat(post_data[postIndexYes][13])) >
            parseInt(post_data[postIndexYes][14])
        ) {
          $("#notification-container").fadeIn(300, function () {});
          document.getElementById("notification-text").innerText = "You aren't allowed to vote in this post because you are outside the event radius";
        } else {
          if (user_yes_no_vote[postIndexYes][0] == true && user_yes_no_vote[postIndexYes][1] == false) {
            fetch("process_data.php", {
              method: "POST",
              body: JSON.stringify({ request: "yes_no_vote", current_vote: "yes", previous_vote: "yes", post_id: post_data[postIndexYes][0] }),
            })
              .then((res) => res.json())
              .then((response) => {
                if (response[2].trim() == "Success") {
                  post_data[postIndexYes][8] = parseInt(response[0]);
                  post_data[postIndexYes][9] = parseInt(response[1]);
                  document.querySelectorAll(".post")[postIndexYes].querySelectorAll(".answer-yes")[0].style.background = "#007e7e";
                  user_yes_no_vote[postIndexYes][0] = false;
                  if (post_data[postIndexYes][2] == 1) {
                    if (parseInt(response[0]) - parseInt(response[1]) > 0) {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].style.color = "#00ffd0";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].className = "fa-solid fa-thumbs-up";
                    } else if (parseInt(response[0]) - parseInt(response[1]) < 0) {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].style.color = "#cc0000";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].className = "fa-solid fa-thumbs-down";
                    } else {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].style.color = "#b5b5b5";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].className = "fa-solid fa-question";
                    }
                  }
                  conn.send(
                    JSON.stringify([
                      "yes_no_vote",
                      "yes_yes",
                      window.getComputedStyle(document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0]).color,
                      post_data[postIndexYes][0],
                      post_data[0][16],
                      post_data[postIndexYes][8],
                      post_data[postIndexYes][9],
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].className,
                    ])
                  );
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
              .then((res) => res.json())
              .then((response) => {
                if (response[2].trim() == "Success") {
                  post_data[postIndexYes][8] = parseInt(response[0]);
                  post_data[postIndexYes][9] = parseInt(response[1]);
                  document.querySelectorAll(".post")[postIndexYes].querySelectorAll(".answer-yes")[0].style.background = "#00ffd0";
                  document.querySelectorAll(".post")[postIndexYes].querySelectorAll(".answer-no")[0].style.background = "#007e7e";
                  user_yes_no_vote[postIndexYes][0] = true;
                  user_yes_no_vote[postIndexYes][1] = false;
                  if (post_data[postIndexYes][2] == 1) {
                    if (parseInt(response[0]) - parseInt(response[1]) > 0) {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].style.color = "#00ffd0";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].className = "fa-solid fa-thumbs-up";
                    } else if (parseInt(response[0]) - parseInt(response[1]) < 0) {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].style.color = "#cc0000";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].className = "fa-solid fa-thumbs-down";
                    } else {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].style.color = "#b5b5b5";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].className = "fa-solid fa-question";
                    }
                  }
                  conn.send(
                    JSON.stringify([
                      "yes_no_vote",
                      "yes_no",
                      window.getComputedStyle(document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0]).color,
                      post_data[postIndexYes][0],
                      post_data[0][16],
                      post_data[postIndexYes][8],
                      post_data[postIndexYes][9],
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].className,
                    ])
                  );
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
              .then((res) => res.json())
              .then((response) => {
                if (response[2] == "Success") {
                  post_data[postIndexYes][8] = parseInt(response[0]);
                  post_data[postIndexYes][9] = parseInt(response[1]);
                  document.querySelectorAll(".post")[postIndexYes].querySelectorAll(".answer-yes")[0].style.background = "#00ffd0";
                  user_yes_no_vote[postIndexYes][0] = true;
                  if (post_data[postIndexYes][2] == 1) {
                    if (parseInt(response[0]) - parseInt(response[1]) > 0) {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].style.color = "#00ffd0";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].className = "fa-solid fa-thumbs-up";
                    } else if (parseInt(response[0]) - parseInt(response[1]) < 0) {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].style.color = "#cc0000";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].className = "fa-solid fa-thumbs-down";
                    } else {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].style.color = "#b5b5b5";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].className = "fa-solid fa-question";
                    }
                  }
                  conn.send(
                    JSON.stringify([
                      "yes_no_vote",
                      "yes_nothing",
                      window.getComputedStyle(document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0]).color,
                      post_data[postIndexYes][0],
                      post_data[0][16],
                      post_data[postIndexYes][8],
                      post_data[postIndexYes][9],
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].className,
                    ])
                  );
                }
                if (window.getComputedStyle(document.getElementsByClassName("myChart")[postIndexYes]).display === "block") {
                  get_yes_no_data(postIndexYes);
                }
              });
          }
        }
      } else if (btn_no) {
        const post_no = btn_no.closest(".post");
        const postIndexNo = [...postContainer.children].indexOf(post_no);
        if (
          post_data[postIndexNo][11] !== null &&
          DateTime.fromFormat(post_data[postIndexNo][11], "yyyy-MM-dd HH:mm:ss").toRelative().search("ago") !== -1
        ) {
          $("#notification-container").fadeIn(300, function () {});
          document.getElementById("notification-text").innerText = "Poll is closed";
        } else if (
          post_data[postIndexNo][12] !== null &&
          calcCrow(user_coordinates[0], user_coordinates[1], parseFloat(post_data[postIndexNo][12]), parseFloat(post_data[postIndexNo][13])) >
            parseInt(post_data[postIndexNo][14])
        ) {
          $("#notification-container").fadeIn(300, function () {});
          document.getElementById("notification-text").innerText = "You aren't allowed to vote in this post because you are outside the event radius";
        } else {
          if (user_yes_no_vote[postIndexNo][0] == false && user_yes_no_vote[postIndexNo][1] == true) {
            fetch("process_data.php", {
              method: "POST",
              body: JSON.stringify({ request: "yes_no_vote", current_vote: "no", previous_vote: "no", post_id: post_data[postIndexNo][0] }),
            })
              .then((res) => res.json())
              .then((response) => {
                if (response[2].trim() == "Success") {
                  post_data[postIndexNo][8] = parseInt(response[0]);
                  post_data[postIndexNo][9] = parseInt(response[1]);
                  document.querySelectorAll(".post")[postIndexNo].querySelectorAll(".answer-no")[0].style.background = "#007e7e";
                  user_yes_no_vote[postIndexNo][1] = false;
                  if (post_data[postIndexNo][2] == 1) {
                    if (parseInt(response[0]) - parseInt(response[1]) > 0) {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].style.color = "#00ffd0";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].className = "fa-solid fa-thumbs-up";
                    } else if (parseInt(response[0]) - parseInt(response[1]) < 0) {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].style.color = "#cc0000";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].className = "fa-solid fa-thumbs-down";
                    } else {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].style.color = "#b5b5b5";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].className = "fa-solid fa-question";
                    }
                  }
                  conn.send(
                    JSON.stringify([
                      "yes_no_vote",
                      "no_no",
                      window.getComputedStyle(document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0]).color,
                      post_data[postIndexNo][0],
                      post_data[0][16],
                      post_data[postIndexNo][8],
                      post_data[postIndexNo][9],
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].className,
                    ])
                  );
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
              .then((res) => res.json())
              .then((response) => {
                if (response[2].trim() == "Success") {
                  post_data[postIndexNo][8] = parseInt(response[0]);
                  post_data[postIndexNo][9] = parseInt(response[1]);
                  document.querySelectorAll(".post")[postIndexNo].querySelectorAll(".answer-yes")[0].style.background = "#007e7e";
                  document.querySelectorAll(".post")[postIndexNo].querySelectorAll(".answer-no")[0].style.background = "#cc0000";
                  user_yes_no_vote[postIndexNo][0] = false;
                  user_yes_no_vote[postIndexNo][1] = true;
                  if (post_data[postIndexNo][2] == 1) {
                    if (parseInt(response[0]) - parseInt(response[1]) > 0) {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].style.color = "#00ffd0";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].className = "fa-solid fa-thumbs-up";
                    } else if (parseInt(response[0]) - parseInt(response[1]) < 0) {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].style.color = "#cc0000";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].className = "fa-solid fa-thumbs-down";
                    } else {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].style.color = "#b5b5b5";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].className = "fa-solid fa-question";
                    }
                  }
                  conn.send(
                    JSON.stringify([
                      "yes_no_vote",
                      "no_yes",
                      window.getComputedStyle(document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0]).color,
                      post_data[postIndexNo][0],
                      post_data[0][16],
                      post_data[postIndexNo][8],
                      post_data[postIndexNo][9],
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].className,
                    ])
                  );
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
              .then((res) => res.json())
              .then((response) => {
                if (response[2].trim() == "Success") {
                  post_data[postIndexNo][8] = parseInt(response[0]);
                  post_data[postIndexNo][9] = parseInt(response[1]);
                  document.querySelectorAll(".post")[postIndexNo].querySelectorAll(".answer-no")[0].style.background = "#cc0000";
                  user_yes_no_vote[postIndexNo][1] = true;
                  if (post_data[postIndexNo][2] == 1) {
                    if (parseInt(response[0]) - parseInt(response[1]) > 0) {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].style.color = "#00ffd0";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].className = "fa-solid fa-thumbs-up";
                    } else if (parseInt(response[0]) - parseInt(response[1]) < 0) {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].style.color = "#cc0000";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].className = "fa-solid fa-thumbs-down";
                    } else {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].style.color = "#b5b5b5";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].className = "fa-solid fa-question";
                    }
                  }
                  conn.send(
                    JSON.stringify([
                      "yes_no_vote",
                      "no_nothing",
                      window.getComputedStyle(document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0]).color,
                      post_data[postIndexNo][0],
                      post_data[0][16],
                      post_data[postIndexNo][8],
                      post_data[postIndexNo][9],
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].className,
                    ])
                  );
                }
                if (window.getComputedStyle(document.getElementsByClassName("myChart")[postIndexNo]).display === "block") {
                  get_yes_no_data(postIndexNo);
                }
              });
          }
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
                conn.send(JSON.stringify(["bookmark_off", post_data[postIndexBookmark][0], post_data[0][16]]));
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
                document.getElementsByClassName("parent_of_bookmark")[postIndexBookmark].children[0].style.color = "#98d9ff";
                post_data[postIndexBookmark][10] = 1;
                conn.send(JSON.stringify(["bookmark_on", post_data[postIndexBookmark][0], post_data[0][16]]));
              }
            });
        }
      } else {
        return;
      }
    } else {
      if (btn_up || btn_down) {
        $("#notification-container").fadeIn(300, function () {});
        document.getElementById("notification-text").innerText = "You have to be logged-in to like or dislike a post";
      } else if (btn_yes || btn_no) {
        $("#notification-container").fadeIn(300, function () {});
        document.getElementById("notification-text").innerText = "You have to be logged-in to vote";
      } else if (btn_bookmark) {
        $("#notification-container").fadeIn(300, function () {});
        document.getElementById("notification-text").innerText = "You have to be logged-in to bookmark a post";
      }
    }
  },
  { passive: true }
);

postContainer.addEventListener("mouseover", (e) => {
  const btn_star = e.target.closest('button[data-dir="star"]');

  if (btn_star) {
    const post_star = btn_star.closest(".post");
    const postIndexStar = [...postContainer.children].indexOf(post_star);
    const rating_choice = btn_star.closest(".rating-choices").getAttribute("data-value");

    let star_range = rating_choice * 10;
    let max_star_position;
    max_star_position = star_range - 10;

    let post_index = document.querySelectorAll(".post")[postIndexStar];

    for (let i = star_range - 10; i < star_range; i++) {
      post_index.getElementsByClassName("half-star-container")[i].style.color = null;
    }

    for (let i = max_star_position; i < parseInt(parseFloat(btn_star.value) * 2.0) + max_star_position; i++) {
      post_index.getElementsByClassName("half-star-container")[i].style.color = "#00ffd0";
    }
  }
});

postContainer.addEventListener("mouseout", (e) => {
  const btn_star = e.target.closest('button[data-dir="star"]');
  if (btn_star) {
    const post_star = btn_star.closest(".post");
    const postIndexStar = [...postContainer.children].indexOf(post_star);
    const rating_choice = btn_star.closest(".rating-choices").getAttribute("data-value");

    let star_range = rating_choice * 10;
    let max_star_position = star_range - 10;
    let star_limit;
    let temp_pos = parseInt(rating_choice) + 21;
    let post_index = document.querySelectorAll(".post")[postIndexStar];

    if (post_data[postIndexStar][temp_pos] === undefined) {
      star_limit = 0 + max_star_position;
    } else {
      star_limit = parseInt(post_data[postIndexStar][temp_pos] * 2.0) + max_star_position;
    }

    if (post_data[postIndexStar][temp_pos] === undefined) {
      star_limit = 0 + max_star_position;
    } else {
      star_limit = parseInt(post_data[postIndexStar][temp_pos] * 2.0) + max_star_position;
    }

    for (let i = max_star_position; i < star_limit; i++) {
      post_index.getElementsByClassName("half-star-container")[i].style.color = "#00ffd0";
    }

    for (let i = star_limit; i < parseInt(parseFloat(btn_star.value) * 2.0) + max_star_position; i++) {
      post_index.getElementsByClassName("half-star-container")[i].style.color = null;
    }
  }
});

//This is for when the user clicks "Bookmarks" on the user navabar.
document.getElementsByClassName("nav-element")[3].addEventListener("click", function () {
  bookmarks_active = true;
  specific_user_posts = null;
});

//This is for when the user clicks "Home" on the left navbar.
document.getElementsByClassName("nav-element")[0].addEventListener("click", function () {
  bookmarks_active = false;
  specific_user_posts = null;
});

//This is for when the user clicks "Change Username" on the user navbar.
document.getElementsByClassName("nav-element")[4].addEventListener("click", function () {
  bookmarks_active = false;
  specific_user_posts = null;
});

//This is for when the user clicks "Change Password" on the user navbar.
document.getElementsByClassName("nav-element")[5].addEventListener("click", function () {
  bookmarks_active = false;
  specific_user_posts = null;
});

//This is for when the user clicks "Analytics" on the user navbar.
document.getElementsByClassName("nav-element")[6].addEventListener("click", function () {
  bookmarks_active = false;
  specific_user_posts = null;
});

//Used to create the charts inside the posts.
function get_yes_no_data(post_number) {
  fetch("process_data.php", {
    method: "POST",
    body: JSON.stringify({ request: "yes_no_data", post_id: post_data[post_number][0] }),
  })
    .then((res) => res.json())
    .then((response) => {
      make_yes_no_chart(post_number, [parseInt(response[0]), parseInt(response[1])]);
    });
}

function get_rating_data(post_number) {
  fetch("process_data.php", {
    method: "POST",
    body: JSON.stringify({ request: "average_rating_data", post_id: post_data[post_number][0] }),
  })
    .then((res) => res.json())
    .then((response) => {
      let choice_names_index;
      let post_element = document.getElementsByClassName("post")[post_number];
      post_element.querySelectorAll(".rating-choices-results").forEach((child) => {
        if (child.getAttribute("data-value") !== "1") {
          child.remove();
        }
      });
      for (let i = 0; i < response.length; i++) {
        let max_star_position = i * 10;
        let star_limit;
        if (post_data[0].length > 14) {
          choice_names_index = i + 17;
        } else {
          choice_names_index = i + 9;
        }
        if (response[i] !== null) {
          let first_digit = parseFloat(response[i][0]);
          let average_rating = parseFloat(response[i]).toFixed(3);
          if (average_rating < first_digit + 0.25) {
            average_rating = parseFloat(response[i][0]);
          } else if (average_rating >= first_digit + 0.25 && average_rating <= first_digit + 0.5) {
            average_rating = parseFloat(response[i][0]) + 0.5;
          } else if (average_rating >= first_digit + 0.5 && average_rating < first_digit + 0.75) {
            average_rating = parseFloat(response[i][0]) + 0.5;
          } else if (average_rating >= first_digit + 0.75) {
            average_rating = parseFloat(response[i][0]) + 1.0;
          }
          star_limit = parseInt(average_rating * 2.0) + max_star_position;
        }
        if (post_data[post_number][choice_names_index] !== null) {
          if (choice_names_index !== choice_names_index - i) {
            let clone_rating_choices = post_element.getElementsByClassName("rating-choices-results")[0];
            let clone = clone_rating_choices.cloneNode(true);
            clone.setAttribute("data-value", i + 1);
            post_element.getElementsByClassName("rating-vote-results")[0].appendChild(clone);
            post_element
              .querySelectorAll(".rating-choices-results")
              [i].querySelectorAll(".half-star-container-results")
              .forEach((half_star) => (half_star.style.color = "#f3f3f3"));
            post_element.querySelectorAll(".rating-choices-results")[i].getElementsByClassName("choice-name")[0].innerText =
              post_data[post_number][choice_names_index];
          } else {
            post_element
              .querySelectorAll(".rating-choices-results")
              [i].querySelectorAll(".half-star-container-results")
              .forEach((half_star) => (half_star.style.color = "#f3f3f3"));
            post_element.querySelectorAll(".rating-choices-results")[i].getElementsByClassName("choice-name")[0].innerText =
              post_data[post_number][choice_names_index];
          }
          if (response[i] !== null) {
            for (let k = max_star_position; k < star_limit; k++) {
              post_element.getElementsByClassName("half-star-container-results")[k].style.color = "#00ffd0";
            }
          }
        }
      }
    });
}

function get_approval_data(post_number) {
  fetch("process_data.php", {
    method: "POST",
    body: JSON.stringify({ request: "approval_data", post_id: post_data[post_number][0] }),
  })
    .then((res) => res.json())
    .then((response) => {
      let post_element = document.getElementsByClassName("post")[post_number];
      let choice_names_index;
      if (post_data[0].length > 14) {
        choice_names_index = 17;
      } else {
        choice_names_index = 9;
      }
      for (let i = 0; i < response.length; i++) {
        if (i < 3) {
          post_element.getElementsByClassName("approval-results-table")[0].rows[i + 1].cells[0].innerText =
            post_data[post_number][i + choice_names_index];
          if (response[i] !== null) {
            post_element.getElementsByClassName("approval-results-table")[0].rows[i + 1].cells[1].innerText = response[i];
          } else {
            post_element.getElementsByClassName("approval-results-table")[0].rows[i + 1].cells[1].innerText = "0";
          }
        } else if (i >= 3 && post_data[post_number][i + choice_names_index] !== null) {
          if (document.querySelectorAll(".approval-results-table")[post_number].rows[i + 1]) {
            document.querySelectorAll(".approval-results-table")[post_number].rows[i + 1].remove();
          }
          let top_row = post_element.getElementsByClassName("approval-results-table")[0].rows[1];
          let clone = top_row.cloneNode(true);
          post_element.getElementsByClassName("approval-results-table")[0].children[0].appendChild(clone);
          document.querySelectorAll(".approval-results-table")[post_number].rows[i + 1].setAttribute("data-value", i + 1);
          post_element.getElementsByClassName("approval-results-table")[0].rows[i + 1].cells[0].innerText =
            post_data[post_number][i + choice_names_index];
          if (response[i] !== null) {
            post_element.getElementsByClassName("approval-results-table")[0].rows[i + 1].cells[1].innerText = response[i];
          } else {
            post_element.getElementsByClassName("approval-results-table")[0].rows[i + 1].cells[1].innerText = "0";
          }
        } else if (i >= 3 && post_data[post_number][i + choice_names_index] === null) {
          if (document.querySelectorAll(".approval-results-table")[post_number].rows[i + 1]) {
            document.querySelectorAll(".approval-results-table")[post_number].rows[i + 1].remove();
          }
        }
      }
    });
}

//Makes yes_no post chart.
export function make_yes_no_chart(post_number, chart_data) {
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
          data: chart_data,
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
            precision: 0,
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
}

//used to clear all posts data each time the user returns to the main page without reloading the page.
export function reset_poll_data() {
  document.querySelectorAll(".fa-chevron-up").forEach((icon) => (icon.style.color = null));
  document.querySelectorAll(".fa-chevron-down").forEach((icon) => (icon.style.color = null));
  document.querySelectorAll(".answer-yes").forEach((icon) => (icon.style.background = null));
  document.querySelectorAll(".answer-no").forEach((icon) => (icon.style.background = null));
  document.querySelectorAll(".show-results").forEach((icon) => (icon.style.background = null));
  document.querySelectorAll(".parent_of_bookmark").forEach((main_class) => (main_class.innerHTML = ""));
  document.querySelectorAll(".parent_of_check_yes_no").forEach((main_class) => (main_class.innerHTML = ""));
  document.querySelectorAll(".poll-timer-container").forEach((main_class) => (main_class.style.display = null));
  document.querySelectorAll(".fa-clock").forEach((main_class) => (main_class.style.color = null));
  document.querySelectorAll(".poll-remaining-time").forEach((main_class) => (main_class.innerText = ""));
  document.querySelectorAll(".chartCard").forEach((main_class) => ((main_class.innerHTML = ""), (main_class.style.display = "none")));
  document.querySelectorAll(".answer-yes").forEach((main_class) => main_class.remove());
  document.querySelectorAll(".answer-no").forEach((main_class) => main_class.remove());
  document.querySelectorAll(".vote").forEach((main_class) => main_class.remove());
  document.querySelectorAll(".rating-vote").forEach((main_class) => {
    main_class.style.display = "none";
  });
  document.querySelectorAll(".rating-choices").forEach((main_class) => {
    if (main_class.getAttribute("data-value") !== "1") {
      main_class.remove();
    }
  });
  document.querySelectorAll(".rating-vote-results").forEach((main_class) => {
    main_class.style.display = "none";
  });
  document.querySelectorAll(".rating-choices-results").forEach((main_class) => {
    if (main_class.getAttribute("data-value") !== "1") {
      main_class.remove();
    }
  });
  document.querySelectorAll(".approval-vote-container").forEach((main_class) => {
    main_class.style.display = "none";
  });
  document.querySelectorAll(".approval-choice").forEach((main_class) => {
    if (main_class.getAttribute("value") !== "1" && main_class.getAttribute("value") !== "2" && main_class.getAttribute("value") !== "3") {
      main_class.remove();
    } else {
      main_class.style.border = null;
      main_class.style.color = null;
    }
  });
  document.querySelectorAll(".approval-vote-results").forEach((main_class) => {
    main_class.style.display = "none";
  });
  document.querySelectorAll(".approval-results-table").forEach((main_class) => {
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

  if (user_choice !== "none") {
    choice_dehighlight(user_choice);
  }
  choice_dehighlight("yes-time-limit");
  choice_dehighlight("no-time-limit");
  choice_dehighlight("yes-location-restriction");
  choice_dehighlight("no-location-restriction");
  user_choice = "none";
  question_choice = "none";
  poll_choices.length = 0;
  poll_choices_number = "";
  document.forms["poll-question"]["question-text"].value = "";
  document.forms["time-choice"]["time-limit-choice"].value = "";
  document.forms["location-choice"]["radius"].value = "";
  document.getElementById("categories").value = "0";
  document.getElementById("poll-choices").value = "0";
  document.getElementById("input-poll-choices").innerHTML = "";
  document.getElementById("next-step").innerText = "Next";

  min_time = DateTime.now().plus({ minutes: 30 }).toFormat("HH:mm");
  min_day = DateTime.now().plus({ minutes: 30 }).toFormat("yyyy-MM-dd");
  max_day = DateTime.now().plus({ years: 1 }).toFormat("yyyy-MM-dd");

  flatpickr("#time-limit-selector", {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
    time_24hr: true,
    enable: [
      {
        from: min_day,
        to: max_day,
      },
    ],
    plugins: [
      new minMaxTimePlugin({
        table: {
          [min_day]: {
            minTime: min_time,
            maxTime: "23:59",
          },
        },
      }),
    ],
  });

  template_status = "0000001";
  event_coordinates.length = 0;
  if (event_marker !== null) {
    event_location_map.removeLayer(event_marker);
  }
  if (allowed_vote_radius !== null) {
    event_location_map.removeLayer(allowed_vote_radius);
  }
  event_marker = null;
  allowed_vote_radius = null;
  event_radius = null;
}

document.getElementById("notification-button").addEventListener("click", function () {
  $("#notification-container").fadeOut(300, function () {});
});

//This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
function calcCrow(lat1, lon1, lat2, lon2) {
  var R = 6371; // km
  var dLat = toRad(lat2 - lat1);
  var dLon = toRad(lon2 - lon1);
  var lat1 = toRad(lat1);
  var lat2 = toRad(lat2);

  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c * 1000;
  return parseInt(d);
}

//Converts numeric degrees to radians.
function toRad(Value) {
  return (Value * Math.PI) / 180;
}

//exports variables to other js files.
export function get_variables() {
  if (post_data.length === undefined || post_data.length === 0) {
    return [bookmarks_active, specific_user_posts];
  } else {
    return [bookmarks_active, specific_user_posts, post_data[0].length, post_data, [user_coordinates[1], user_coordinates[0]], specific_user_posts];
  }
}

//Clears filter styles.
export function null_all_styles() {
  null_style("fa-fire-flame-curved");
  null_style("fa-sun");
  null_style("fa-table-list");
  null_style("fa-filter");
  null_style("fa-magnifying-glass");
}

//Adds new post data that was received from websocket.
export function add_new_post(new_post) {
  post_data.unshift(new_post);
  if (new_post.length > 14) {
    post_data[0][16] = post_data[1][16];
  }
  user_chevron_vote.unshift([false, false]);
  user_yes_no_vote.unshift([false, false]);
  console.log(post_data);
  myChart.unshift(null);
}

//Adds new chevron data that was received from websocket.
export function edit_chevron(position, value, vote_bool) {
  $(document.querySelectorAll(".post")[position].querySelectorAll(".score")[0]).fadeOut(300, function () {
    document.querySelectorAll(".post")[position].querySelectorAll(".score")[0].innerText = value;
    $(document.querySelectorAll(".post")[position].querySelectorAll(".score")[0]).fadeIn(300, function () {});
  });
  post_data[position][5] = parseInt(value);
  if (vote_bool !== null) {
    user_chevron_vote[position][0] = vote_bool[0];
    user_chevron_vote[position][1] = vote_bool[1];
  }
}

//Adds new vote data that was received from websocket.
export function edit_vote(position, value_yes, value_no, vote_bool) {
  post_data[position][8] = value_yes;
  post_data[position][9] = value_no;
  if (vote_bool !== null) {
    user_yes_no_vote[position][0] = vote_bool[0];
    user_yes_no_vote[position][1] = vote_bool[1];
  }
}

//Adds new vote data that was received from websocket.
export function edit_rating_vote(position, votes) {
  for (let i = 0; i < votes.length; i++) {
    post_data[position][i + 22] = votes[i];
  }
}

export function edit_approval_vote(position, votes) {
  for (let i = 0; i < votes.length; i++) {
    post_data[position][i + 27] = votes[i];
  }
}

//Adds new bookmark data that was received from websocket.
export function edit_bookmark(position, value) {
  post_data[position][10] = value;
}

document.onvisibilitychange = () => {
  if (document.visibilityState === "hidden" && user_coordinates[0] !== undefined) {
    conn.send(JSON.stringify(["admin_map_delete_marker", user_coordinates[0], user_coordinates[1]]));
  }
  if (document.visibilityState === "visible" && user_coordinates[0] !== undefined) {
    conn.send(JSON.stringify(["new_online_user", user_coordinates[0], user_coordinates[1]]));
  }
};

window.onbeforeunload = () => {
  if (user_coordinates[0] !== undefined) {
    conn.send(JSON.stringify(["admin_map_delete_marker", user_coordinates[0], user_coordinates[1]]));
  }
};
