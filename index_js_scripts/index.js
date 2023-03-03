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
let event_map = null; //This is for the event map for each post
let delete_post = null; //This is for deleting posts
let your_username = null; //Placeholder for username of the the active user in case Bookmarks is empty
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
fetch("https://ipinfo.io/json?token=ffc97ce1d646e9")
  .then((response) => response.json())
  .then((jsonResponse) => {
    const loc = jsonResponse.loc.split(",");
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
          $("#app-title-container").fadeOut(300, function () {});
          $("#all-filters").fadeOut(300, function () {});
          $("#notification-container").fadeOut(300, function () {});
          $("#delete-notification-container").fadeOut(300, function () {});
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
          $("#app-title-container").fadeOut(300, function () {});
          $("#all-filters").fadeOut(300, function () {});
          $("#notification-container").fadeOut(300, function () {});
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
            if (user_choice === "approval") {
              const choices_select = document.getElementById("poll-choices");
              for (let i = 5; i < 19; i++) {
                choices_select.children[i].style.display = "none";
              }
            } else {
              const choices_select = document.getElementById("poll-choices");
              for (let i = 5; i < 19; i++) {
                choices_select.children[i].style.display = null;
              }
            }
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
            if (i === 0) {
              let new_poll_choices_desc = document.createElement("div");
              new_poll_choices_desc.className = "poll-choices-instruction";
              document.getElementById("input-poll-choices").appendChild(new_poll_choices_desc);
              document.getElementById("input-poll-choices").children[i + pos].innerText = "Your choices can have up to 50 characters";
            }
            let new_poll_choices_instruction = document.createElement("label");
            new_poll_choices_instruction.className = "poll-choices-instruction";
            document.getElementById("input-poll-choices").appendChild(new_poll_choices_instruction);
            document.getElementById("input-poll-choices").children[i + pos + 1].innerText = "Choice " + (i + 1);

            let new_write_poll_choice = document.createElement("input");
            new_write_poll_choice.className = "write-poll-choice";
            document.getElementById("input-poll-choices").appendChild(new_write_poll_choice);
            document.getElementById("input-poll-choices").children[i + pos + 2].setAttribute("type", "text");
            document.getElementById("input-poll-choices").children[i + pos + 2].name = "poll-choice";
            document.getElementById("input-poll-choices").children[i + pos + 2].maxLength = 11;
            document.getElementById("input-poll-choices").children[i + pos + 2].placeholder = "Type Choice " + (i + 1);
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
            $("#add-post-icon").fadeIn(300, function () {});
            $("#app-title-container").fadeIn(300, function () {});
            $("#all-filters").fadeIn(300, function () {});
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
export function generate_posts(
  bookmark_filter,
  filter_hot,
  filter_preferred_categories,
  filter_filter,
  filter_search,
  user_search,
  radius_filter,
  posts_in_region_filter,
  filter_button
) {
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
      posts_in_region_filter: posts_in_region_filter,
    }),
  })
    .then((res) => res.json())
    .then((response) => {
      if (bookmark_filter === false && your_username === null) {
        your_username = response[0][16];
      }
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
          if (post_data[0].length > 15) {
            if (post_data[i][2] == 1) {
              document.getElementsByClassName("total-votes-text")[0].innerText = "Number of Votes: " + post_data[i][17];
            } else if (post_data[i][2] == 2) {
              document.getElementsByClassName("total-votes-text")[0].innerText = "Number of Votes: " + post_data[i][18];
            } else if (post_data[i][2] == 3) {
              document.getElementsByClassName("total-votes-text")[0].innerText = "Number of Votes: " + post_data[i][19];
            } else if (post_data[i][2] == 4) {
              document.getElementsByClassName("total-votes-text")[0].innerText = "Number of Votes: " + "1";
            }
          } else if (post_data[0].length <= 15) {
            if (post_data[i][2] == 1) {
              document.getElementsByClassName("total-votes-text")[0].innerText = "Number of Votes: " + post_data[i][12];
            } else if (post_data[i][2] == 2) {
              document.getElementsByClassName("total-votes-text")[0].innerText = "Number of Votes: " + post_data[i][13];
            } else if (post_data[i][2] == 3) {
              document.getElementsByClassName("total-votes-text")[0].innerText = "Number of Votes: " + post_data[i][14];
            } else if (post_data[i][2] == 4) {
              document.getElementsByClassName("total-votes-text")[0].innerText = "Number of Votes: " + "1";
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
          if (post_data[0].length > 15) {
            if (post_data[i][2] == 1) {
              clone[i - 1].querySelectorAll(".total-votes-text")[0].innerText = "Number of Votes: " + post_data[i][17];
            } else if (post_data[i][2] == 2) {
              clone[i - 1].querySelectorAll(".total-votes-text")[0].innerText = "Number of Votes: " + post_data[i][18];
            } else if (post_data[i][2] == 3) {
              clone[i - 1].querySelectorAll(".total-votes-text")[0].innerText = "Number of Votes: " + post_data[i][19];
            } else if (post_data[i][2] == 4) {
              clone[i - 1].querySelectorAll(".total-votes-text")[0].innerText = "Number of Votes: " + "1";
            }
          } else if (post_data[0].length <= 15) {
            if (post_data[i][2] == 1) {
              clone[i - 1].querySelectorAll(".total-votes-text")[0].innerText = "Number of Votes: " + post_data[i][12];
            } else if (post_data[i][2] == 2) {
              clone[i - 1].querySelectorAll(".total-votes-text")[0].innerText = "Number of Votes: " + post_data[i][13];
            } else if (post_data[i][2] == 3) {
              clone[i - 1].querySelectorAll(".total-votes-text")[0].innerText = "Number of Votes: " + post_data[i][14];
            } else if (post_data[i][2] == 4) {
              clone[i - 1].querySelectorAll(".total-votes-text")[0].innerText = "Number of Votes: " + "1";
            }
          }
          document.getElementById("posts-container").appendChild(clone[i - 1]);
        }
      }
      if (post_time !== undefined && post_time !== null) {
        if (post_data[0].length > 15) {
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
            if (post_data[i][1] === post_data[i][16]) {
              let new_delete_div = document.createElement("div");
              new_delete_div.className = "post-delete";
              document.getElementsByClassName("post-options-inside-container")[i].appendChild(new_delete_div);
              new_delete_div.setAttribute("data-dir", "delete");
              new_delete_div.innerText = "Delete";

              let new_delete_icon = document.createElement("i");
              new_delete_icon.className = "fa-solid fa-trash-can";
              document
                .getElementsByClassName("post-options-inside-container")
                [i].getElementsByClassName("post-delete")[0]
                .insertBefore(new_delete_icon, new_delete_div.firstChild);
            } else {
              let element_style = document
                .getElementsByClassName("post-options-inside-container")
                [i].getElementsByClassName("post-event-location")[0];
              element_style.style.borderBottom = "0.1em solid #858585";
              element_style.style.borderRadius = "0 0 0.5em 0.5em";
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
              document.getElementsByClassName("parent_of_check_yes_no_details")[i].innerText = "More Yes Answers";
            } else if (post_data[i][15] < 0 && post_data[i][2] == 1) {
              let new_check = document.createElement("i");
              new_check.className = "fa-solid fa-thumbs-down";
              document.getElementsByClassName("parent_of_check_yes_no")[i].appendChild(new_check);
              document.getElementsByClassName("parent_of_check_yes_no")[i].children[0].style.color = "#cc0000";
              document.getElementsByClassName("parent_of_check_yes_no_details")[i].innerText = "More No Answers";
            } else if (post_data[i][15] == 0 && post_data[i][2] == 1) {
              let new_check = document.createElement("i");
              new_check.className = "fa-solid fa-question";
              document.getElementsByClassName("parent_of_check_yes_no")[i].appendChild(new_check);
              document.getElementsByClassName("parent_of_check_yes_no")[i].children[0].style.color = "#b5b5b5";
              document.getElementsByClassName("parent_of_check_yes_no_details")[i].innerText = "Tie of Yes and No Answers";
            }
            let new_canvas = document.createElement("canvas");
            new_canvas.className = "myChart";
            document
              .getElementsByClassName("chartCard")
              [i].insertBefore(new_canvas, document.getElementsByClassName("yes-no-total-votes-container")[i]);
          }
        } else if (post_data[0].length <= 15) {
          for (let i = 0; i < post_data.length; i++) {
            let new_bookmark = document.createElement("i");
            new_bookmark.className = "fa-regular fa-bookmark";
            document.getElementsByClassName("parent_of_bookmark")[i].appendChild(new_bookmark);
            let new_canvas = document.createElement("canvas");
            new_canvas.className = "myChart";
            document
              .getElementsByClassName("chartCard")
              [i].insertBefore(new_canvas, document.getElementsByClassName("yes-no-total-votes-container")[i]);
            let element_style = document.getElementsByClassName("post-options-inside-container")[i].getElementsByClassName("post-event-location")[0];
            element_style.style.borderBottom = "0.1em solid #858585";
            element_style.style.borderRadius = "0 0 0.5em 0.5em";
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
              document.getElementsByClassName("parent_of_check_yes_no_details")[i].innerText = "More Yes Answers";
            } else if (post_data[i][8] < 0 && post_data[i][2] == 1) {
              let new_check = document.createElement("i");
              new_check.className = "fa-solid fa-thumbs-down";
              document.getElementsByClassName("parent_of_check_yes_no")[i].appendChild(new_check);
              document.getElementsByClassName("parent_of_check_yes_no")[i].children[0].style.color = "#cc0000";
              document.getElementsByClassName("parent_of_check_yes_no_details")[i].innerText = "More No Answers";
            } else if (post_data[i][8] == 0 && post_data[i][2] == 1) {
              let new_check = document.createElement("i");
              new_check.className = "fa-solid fa-question";
              document.getElementsByClassName("parent_of_check_yes_no")[i].appendChild(new_check);
              document.getElementsByClassName("parent_of_check_yes_no")[i].children[0].style.color = "#b5b5b5";
              document.getElementsByClassName("parent_of_check_yes_no_details")[i].innerText = "Tie of Yes and No Answers";
            }
          }
        }
        $("#add-post-icon").fadeIn(300, function () {});
        $("#app-title-container").fadeIn(300, function () {});
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
        $("#app-title-container").fadeIn(300, function () {});
        $("#all-filters").fadeIn(300, function () {});
      }
      console.log(post_data);
      if (window.getComputedStyle(document.getElementById("filters-outside-container")).display !== "none" && filter_button === true) {
        document.getElementsByClassName("post")[0].scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
      }
      if (post_data.length === 0) {
        $("#notification-container").fadeIn(300, function () {});
        document.getElementById("notification-text").innerText = "No posts found";
      }
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
    const btn_options = e.target.closest('div[data-dir="options"]');
    const btn_download = e.target.closest('div[data-dir="download-data"]');
    const btn_event_map = e.target.closest('div[data-dir="event-location"]');
    const btn_delete = e.target.closest('div[data-dir="delete"]');
    const btn_download_results_img = e.target.closest('button[data-dir="download-results-img"]');
    const btn_download_results_pdf = e.target.closest('button[data-dir="download-results-pdf"]');

    if (btn_vote) {
      const post_vote = btn_vote.closest(".post");
      const postIndexVote = [...postContainer.children].indexOf(post_vote);
      if (post_data[0].length > 15) {
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
          document.getElementsByClassName("post-critic")[postIndexVote].style.marginBottom = "1em";
          if (post_data[postIndexVote][2] == "2") {
            if (window.getComputedStyle(document.getElementsByClassName("rating-vote")[postIndexVote]).display === "flex") {
              document.querySelectorAll(".post")[postIndexVote].getElementsByClassName("vote")[0].style.backgroundColor = null;
              document.querySelectorAll(".post")[postIndexVote].getElementsByClassName("rating-vote")[0].style.display = "none";
              document.getElementsByClassName("post-critic")[postIndexVote].style.marginBottom = null;
            } else {
              if (window.getComputedStyle(document.getElementsByClassName("rating-vote-results")[postIndexVote]).display === "flex") {
                document.querySelectorAll(".show-results")[postIndexVote].style.backgroundColor = "#00a1ff80";
                document.querySelectorAll(".rating-vote-results")[postIndexVote].style.display = "none";
              }
              document.querySelectorAll(".post")[postIndexVote].getElementsByClassName("vote")[0].style.backgroundColor = "#00ffd0";
              fetch("process_data.php", {
                method: "POST",
                body: JSON.stringify({ request: "user_rating_vote_data", post_id: post_data[postIndexVote][0] }),
              })
                .then((res) => res.json())
                .then((response) => {
                  let post_element = document.getElementsByClassName("post")[postIndexVote];
                  if (post_data[postIndexVote].length > 20) {
                    post_data[postIndexVote].length = 20;
                  }
                  post_data[postIndexVote] = post_data[postIndexVote].concat(response);
                  post_element.querySelectorAll(".rating-choices").forEach((child) => {
                    if (child.getAttribute("data-value") !== "1") {
                      child.remove();
                    }
                  });
                  for (let j = 0; j < 20; j++) {
                    let star_range = (j + 1) * 10;
                    let max_star_position = star_range - 10;
                    let star_limit;
                    if (response[j + 20] !== null) {
                      star_limit = parseInt(response[j + 20] * 2.0) + max_star_position;
                    }
                    if (response[j] !== null) {
                      if (j !== 0) {
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
                        post_element.querySelectorAll(".rating-choices")[j].getElementsByClassName("choice-name")[0].innerText = response[j];
                      } else {
                        post_element
                          .querySelectorAll(".rating-choices")
                          [j].querySelectorAll(".half-star-container")
                          .forEach((half_star) => (half_star.style.color = "#f3f3f3"));
                        post_element.querySelectorAll(".rating-choices")[j].getElementsByClassName("choice-name")[0].innerText = response[j];
                      }
                      if (response[j + 20] !== null) {
                        for (let k = max_star_position; k < star_limit; k++) {
                          post_element.getElementsByClassName("half-star-container")[k].style.color = "#00ffd0";
                        }
                      }
                    }
                  }
                  document.querySelectorAll(".total-votes-container")[postIndexVote].style.display = "flex";
                  document.querySelectorAll(".post")[postIndexVote].getElementsByClassName("rating-vote")[0].style.display = "flex";
                });
            }
          } else if (post_data[postIndexVote][2] == "3") {
            if (window.getComputedStyle(document.getElementsByClassName("approval-vote-container")[postIndexVote]).display === "flex") {
              document.querySelectorAll(".post")[postIndexVote].getElementsByClassName("vote")[0].style.backgroundColor = null;
              document.querySelectorAll(".post")[postIndexVote].getElementsByClassName("approval-vote-container")[0].style.display = "none";
              document.getElementsByClassName("post-critic")[postIndexVote].style.marginBottom = null;
            } else {
              if (window.getComputedStyle(document.getElementsByClassName("approval-vote-results")[postIndexVote]).display === "flex") {
                document.querySelectorAll(".show-results")[postIndexVote].style.backgroundColor = "#00a1ff80";
                document.querySelectorAll(".approval-vote-results")[postIndexVote].style.display = "none";
              }
              document.querySelectorAll(".total-votes-container")[postIndexVote].style.display = "flex";
              document.querySelectorAll(".post")[postIndexVote].getElementsByClassName("vote")[0].style.backgroundColor = "#00ffd0";
              document.querySelectorAll(".post")[postIndexVote].getElementsByClassName("approval-vote-container")[0].style.display = "flex";
              fetch("process_data.php", {
                method: "POST",
                body: JSON.stringify({ request: "user_approval_vote_data", post_id: post_data[postIndexVote][0] }),
              })
                .then((res) => res.json())
                .then((response) => {
                  let post_element = document.getElementsByClassName("post")[postIndexVote];
                  if (post_data[postIndexVote].length > 20) {
                    post_data[postIndexVote].length = 20;
                  }
                  post_data[postIndexVote] = post_data[postIndexVote].concat(response);
                  post_element.querySelectorAll(".approval-pair").forEach((child) => {
                    if (child.getAttribute("value") !== "1" && child.getAttribute("value") !== "2" && child.getAttribute("value") !== "3") {
                      child.remove();
                    }
                  });
                  let pos = 0;
                  for (let j = 0; j < response[response.length - 1] - 1; j++) {
                    for (let k = j + 1; k < response[response.length - 1]; k++) {
                      if (pos > 5) {
                        let clone_approval_pair = post_element.getElementsByClassName("approval-pair")[0];
                        let clone = clone_approval_pair.cloneNode(true);
                        clone.getElementsByClassName("approval-choice")[0].setAttribute("value", pos + 1);
                        clone.getElementsByClassName("approval-choice")[1].setAttribute("value", pos + 2);
                        clone.setAttribute("value", (pos + 2) / 2);
                        post_element.getElementsByClassName("approval-choices-container")[0].appendChild(clone);
                      }
                      post_element.querySelectorAll(".approval-choices-container")[0].getElementsByClassName("approval-choice")[pos].innerText =
                        response[j];
                      post_element.querySelectorAll(".approval-choices-container")[0].getElementsByClassName("approval-choice")[pos + 1].innerText =
                        response[k];
                      pos += 2;
                    }
                  }
                  let k = response[response.length - 1];
                  let pair_pos = 0;
                  for (k; k < response.length - 1; k++) {
                    if (response[k] === "1") {
                      post_element.getElementsByClassName("approval-pair")[pair_pos].getElementsByClassName("approval-choice")[0].style.border =
                        "0.1em solid #cc0000";
                      post_element.getElementsByClassName("approval-pair")[pair_pos].getElementsByClassName("approval-choice")[0].style.color =
                        "#cc0000";
                      post_element.getElementsByClassName("approval-pair")[pair_pos].getElementsByClassName("approval-choice")[1].style.border =
                        "0.1em solid #1a1a1b";
                      post_element.getElementsByClassName("approval-pair")[pair_pos].getElementsByClassName("approval-choice")[1].style.color =
                        "#f3f3f3";
                    } else if (response[k] === "-1") {
                      post_element.getElementsByClassName("approval-pair")[pair_pos].getElementsByClassName("approval-choice")[1].style.border =
                        "0.1em solid #cc0000";
                      post_element.getElementsByClassName("approval-pair")[pair_pos].getElementsByClassName("approval-choice")[1].style.color =
                        "#cc0000";
                      post_element.getElementsByClassName("approval-pair")[pair_pos].getElementsByClassName("approval-choice")[0].style.border =
                        "0.1em solid #1a1a1b";
                      post_element.getElementsByClassName("approval-pair")[pair_pos].getElementsByClassName("approval-choice")[0].style.color =
                        "#f3f3f3";
                    } else {
                      post_element.getElementsByClassName("approval-pair")[pair_pos].getElementsByClassName("approval-choice")[0].style.border =
                        "0.1em solid #1a1a1b";
                      post_element.getElementsByClassName("approval-pair")[pair_pos].getElementsByClassName("approval-choice")[0].style.color =
                        "#f3f3f3";
                      post_element.getElementsByClassName("approval-pair")[pair_pos].getElementsByClassName("approval-choice")[1].style.border =
                        "0.1em solid #1a1a1b";
                      post_element.getElementsByClassName("approval-pair")[pair_pos].getElementsByClassName("approval-choice")[1].style.color =
                        "#f3f3f3";
                    }
                    pair_pos += 1;
                  }
                });
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

      document.getElementsByClassName("post-critic")[postIndexShowResults].style.marginBottom = "1em";
      if (post_data[postIndexShowResults][2] == 1)
        if (window.getComputedStyle(document.getElementsByClassName("myChart")[postIndexShowResults]).display === "block") {
          document.querySelectorAll(".show-results")[postIndexShowResults].style.backgroundColor = "#00a1ff80";
          document.querySelectorAll(".yes-no-results-container")[postIndexShowResults].style.display = "none";
          document.querySelectorAll(".total-votes-container")[postIndexShowResults].style.display = "flex";
          if (myChart[postIndexShowResults]) {
            myChart[postIndexShowResults].destroy();
          }
          document.getElementsByClassName("post-critic")[postIndexShowResults].style.marginBottom = null;
        } else {
          document.querySelectorAll(".show-results")[postIndexShowResults].style.backgroundColor = "#00a1ff";
          get_yes_no_data(postIndexShowResults);
        }
      else if (post_data[postIndexShowResults][2] == 2) {
        if (window.getComputedStyle(document.getElementsByClassName("rating-vote-results")[postIndexShowResults]).display === "flex") {
          document.querySelectorAll(".show-results")[postIndexShowResults].style.backgroundColor = "#00a1ff80";
          document.querySelectorAll(".rating-vote-results")[postIndexShowResults].style.display = "none";
          document.querySelectorAll(".total-votes-container")[postIndexShowResults].style.display = "flex";
          document.getElementsByClassName("post-critic")[postIndexShowResults].style.marginBottom = null;
        } else {
          if (window.getComputedStyle(document.getElementsByClassName("rating-vote")[postIndexShowResults]).display === "flex") {
            document.querySelectorAll(".post")[postIndexShowResults].getElementsByClassName("vote")[0].style.backgroundColor = null;
            document.querySelectorAll(".rating-vote")[postIndexShowResults].style.display = "none";
          }
          document.querySelectorAll(".total-votes-container")[postIndexShowResults].style.display = "none";
          document.querySelectorAll(".show-results")[postIndexShowResults].style.backgroundColor = "#00a1ff";
          document.querySelectorAll(".rating-vote-results")[postIndexShowResults].style.display = "flex";
          get_rating_data(postIndexShowResults);
        }
      } else if (post_data[postIndexShowResults][2] == 3) {
        if (window.getComputedStyle(document.getElementsByClassName("approval-vote-results")[postIndexShowResults]).display === "flex") {
          document.querySelectorAll(".show-results")[postIndexShowResults].style.backgroundColor = "#00a1ff80";
          document.querySelectorAll(".approval-vote-results")[postIndexShowResults].style.display = "none";
          document.querySelectorAll(".total-votes-container")[postIndexShowResults].style.display = "flex";
          document.getElementsByClassName("post-critic")[postIndexShowResults].style.marginBottom = null;
        } else {
          if (window.getComputedStyle(document.getElementsByClassName("approval-vote-container")[postIndexShowResults]).display === "flex") {
            document.querySelectorAll(".post")[postIndexShowResults].getElementsByClassName("vote")[0].style.backgroundColor = null;
            document.querySelectorAll(".approval-vote-container")[postIndexShowResults].style.display = "none";
          }
          document.querySelectorAll(".total-votes-container")[postIndexShowResults].style.display = "none";
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
          generate_posts(false, null, null, null, null, post_data[postIndexPostUserName][1], null, null);
        });
    } else if (btn_download) {
      const post_download = btn_download.closest(".post");
      const postDownloadIndex = [...postContainer.children].indexOf(post_download);
      if (post_data[postDownloadIndex][2] == 1) {
        fetch("process_data.php", {
          method: "POST",
          body: JSON.stringify({ request: "yes_no_data", post_id: post_data[postDownloadIndex][0] }),
        })
          .then((res) => res.json())
          .then((response) => {
            const wb = XLSX.utils.book_new();
            let cell = [["Poll Text: " + post_data[postDownloadIndex][4]], ["Yes", "No"], [parseInt(response[0]), parseInt(response[1])]];
            const ws = XLSX.utils.aoa_to_sheet(cell);
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
            XLSX.writeFile(wb, "Yes_No_Poll_Type_Results.xlsx");
          });
      } else if (post_data[postDownloadIndex][2] == 2) {
        fetch("process_data.php", {
          method: "POST",
          body: JSON.stringify({ request: "average_rating_data", post_id: post_data[postDownloadIndex][0] }),
        })
          .then((res) => res.json())
          .then((response) => {
            let average_ratings_array = [];
            let rating_choice_names = [];
            let zipped = [];

            for (let i = 0; i < 40; i++) {
              if (i >= 20) {
                rating_choice_names.push(response[i]);
              } else {
                average_ratings_array.push(response[i]);
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

            for (let i = 0; i < zipped.length; i++) {
              if (rating_choice_names[i] !== null && average_ratings_array[i] === null) {
                average_ratings_array[i] = "No Votes";
              }
            }
            const wb = XLSX.utils.book_new();
            let cell = [["Poll Text: " + post_data[postDownloadIndex][4]], rating_choice_names, average_ratings_array];
            const ws = XLSX.utils.aoa_to_sheet(cell);
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
            XLSX.writeFile(wb, "Rating_Poll_Type_Results.xlsx");
          });
      } else if (post_data[postDownloadIndex][2] == 3) {
        fetch("process_data.php", {
          method: "POST",
          body: JSON.stringify({ request: "approval_data", post_id: post_data[postDownloadIndex][0] }),
        })
          .then((res) => res.json())
          .then((response) => {
            let approval_choice_results = [];
            let upper_diagonal_plus = [];
            let upper_diagonal_minus = [];
            let results_array = [];
            let results_array_pairwise = [];
            let approval_choice_names_scores = [];
            let limit = 0;
            let sim_dod = [];

            function compare_by_score(a, b) {
              return a.score - b.score;
            }
            if (response.length === 10) {
              limit = 9;
              for (let i = 0; i < limit; i++) {
                if (i < 3) {
                  upper_diagonal_plus.push(parseInt(response[i]));
                  upper_diagonal_minus.push(parseInt(response[i]) - parseInt(response[i + 3]));
                } else if (i >= 3 && i < 6) {
                  results_array.push(parseInt(response[i]));
                } else if (i >= 6) {
                  approval_choice_names_scores.push({ name: response[i], score: 0 });
                  sim_dod.push(0);
                }
              }
            } else if (response.length === 17) {
              limit = 16;
              for (let i = 0; i < limit; i++) {
                if (i < 6) {
                  upper_diagonal_plus.push(parseInt(response[i]));
                  upper_diagonal_minus.push(parseInt(response[i]) - parseInt(response[i + 6]));
                } else if (i >= 6 && i < 12) {
                  results_array.push(parseInt(response[i]));
                } else if (i >= 12) {
                  approval_choice_names_scores.push({ name: response[i], score: 0 });
                  sim_dod.push(0);
                }
              }
            } else if (response.length === 26) {
              limit = 25;
              for (let i = 0; i < limit; i++) {
                if (i < 10) {
                  upper_diagonal_plus.push(parseInt(response[i]));
                  upper_diagonal_minus.push(parseInt(response[i]) - parseInt(response[i + 10]));
                } else if (i >= 10 && i < 20) {
                  results_array.push(parseInt(response[i]));
                } else if (i >= 20) {
                  approval_choice_names_scores.push({ name: response[i], score: 0 });
                  sim_dod.push(0);
                }
              }
            } else if (response.length === 37) {
              limit = 36;
              for (let i = 0; i < limit; i++) {
                if (i < 15) {
                  upper_diagonal_plus.push(parseInt(response[i]));
                  upper_diagonal_minus.push(parseInt(response[i]) - parseInt(response[i + 15]));
                } else if (i >= 15 && i < 30) {
                  results_array.push(parseInt(response[i]));
                } else if (i >= 30) {
                  approval_choice_names_scores.push({ name: response[i], score: 0 });
                  sim_dod.push(0);
                }
              }
            }

            //Create an array of objects that has every pair of choices combination as "pair" and the weight of that pair as "score"
            let pos_results_pair_up = 0;
            for (let i = 0; i < approval_choice_names_scores.length; i++) {
              for (let j = 0; j < approval_choice_names_scores.length; j++) {
                if (approval_choice_names_scores[i].name == approval_choice_names_scores[j].name) {
                  results_array_pairwise.push({
                    pair: approval_choice_names_scores[i].name + approval_choice_names_scores[j].name,
                    score: 0,
                  });
                } else {
                  if (i < j) {
                    results_array_pairwise.push({
                      pair: approval_choice_names_scores[i].name + approval_choice_names_scores[j].name,
                      score:
                        results_array[pos_results_pair_up] / (upper_diagonal_plus[pos_results_pair_up] + upper_diagonal_minus[pos_results_pair_up]),
                    });
                    results_array_pairwise.push({
                      pair: approval_choice_names_scores[j].name + approval_choice_names_scores[i].name,
                      score:
                        -results_array[pos_results_pair_up] / (upper_diagonal_plus[pos_results_pair_up] + upper_diagonal_minus[pos_results_pair_up]),
                    });
                    pos_results_pair_up++;
                  }
                }
              }
            }

            //Calculate true Dodgson score for each choice
            let pos_plus = 0;
            let pos_minus = 0;
            for (let i = 0; i < approval_choice_names_scores.length; i++) {
              for (let j = 0; j < approval_choice_names_scores.length; j++) {
                if (approval_choice_names_scores[i].name == approval_choice_names_scores[j].name) {
                  continue;
                } else {
                  if (i < j) {
                    sim_dod[i] += parseInt(upper_diagonal_minus[pos_minus]);
                    pos_minus++;
                  } else if (i > j) {
                    sim_dod[i] += parseInt(upper_diagonal_plus[pos_plus]);
                    pos_plus++;
                  }
                }
              }
              approval_choice_names_scores[i].score =
                approval_choice_names_scores.length * sim_dod[i] +
                approval_choice_names_scores.length * (Math.log(approval_choice_names_scores.length) + 1);
            }
            approval_choice_names_scores.sort(compare_by_score);

            //Fill results table
            let pair_index = 0;
            let cell = [["Poll Text: " + post_data[postDownloadIndex][4]]];
            for (let i = 0; i < approval_choice_names_scores.length + 1; i++) {
              approval_choice_results[i] = [];
              for (let j = 0; j < approval_choice_names_scores.length + 1; j++) {
                if (i > 0 && j == 0) {
                  approval_choice_results[i][j] = approval_choice_names_scores[i - 1].name;
                } else if (i == 0 && j > 0) {
                  approval_choice_results[i][j] = approval_choice_names_scores[j - 1].name;
                } else if (i == j && i > 0 && j > 0) {
                  approval_choice_results[i][j] = "-";
                } else {
                  pair_index = results_array_pairwise.findIndex((item) => item.pair == approval_choice_results[i][0] + approval_choice_results[0][j]);
                  if (pair_index >= 0) {
                    if (!isNaN(results_array_pairwise[pair_index].score)) {
                      approval_choice_results[i][j] = results_array_pairwise[pair_index].score.toFixed(2);
                    } else {
                      approval_choice_results[i][j] = "0";
                    }
                  }
                }
              }
              cell.push(approval_choice_results[i]);
            }
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(cell);
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
            XLSX.writeFile(wb, "Approval_Poll_Type_Results.xlsx");
          });
      }
    } else if (btn_event_map) {
      const post_event_map = btn_event_map.closest(".post");
      const postEventIndex = [...postContainer.children].indexOf(post_event_map);
      document.getElementsByClassName("post-options-inside-container")[postEventIndex].style.display = "none";
      if (window.getComputedStyle(document.getElementById("post-locations-container")).display !== "none") {
        $("#post-locations-container").fadeOut(300, function () {});
        null_style("fa-map-location-dot");
      }
      let data_index_lat;
      let data_index_long;
      let data_index_radius;
      if (post_data[0].length > 15) {
        data_index_lat = 12;
        data_index_long = 13;
        data_index_radius = 14;
      } else if (post_data[0].length <= 15) {
        data_index_lat = 9;
        data_index_long = 10;
        data_index_radius = 11;
      }

      if (post_data[postEventIndex][data_index_lat] !== null) {
        if (event_map !== null) {
          event_map.remove();
        }
        document.getElementById("event-map-container").style.display = "flex";
        event_map = L.map(document.getElementById("post-event-location-map")).setView(
          [post_data[postEventIndex][data_index_lat], post_data[postEventIndex][data_index_long]],
          10
        );

        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(event_map);

        L.marker([post_data[postEventIndex][data_index_lat], post_data[postEventIndex][data_index_long]])
          .bindPopup(
            "Location Coordinates: " + "<br>" + post_data[postEventIndex][data_index_lat] + "<br>" + post_data[postEventIndex][data_index_long]
          )
          .addTo(event_map);

        L.circle([post_data[postEventIndex][data_index_lat], post_data[postEventIndex][data_index_long]], {
          radius: post_data[postEventIndex][data_index_radius],
        }).addTo(event_map);
      } else {
        $("#notification-container").fadeIn(300, function () {});
        document.getElementById("notification-text").innerText = "This poll's event location hasn't been set";
      }
    } else if (btn_options) {
      const post_options = btn_options.closest(".post");
      const postOptionsIndex = [...postContainer.children].indexOf(post_options);
      let element = document.getElementsByClassName("post-options-inside-container")[postOptionsIndex];
      document.querySelectorAll(".post-options-inside-container").forEach((element) => {
        if (window.getComputedStyle(element).display !== "none") {
          if (element !== document.getElementsByClassName("post-options-inside-container")[postOptionsIndex]) {
            element.style.display = "none";
          }
        }
      });
      if (window.getComputedStyle(element).display === "none") {
        element.style.display = "flex";
      } else if (window.getComputedStyle(element).display === "flex") {
        element.style.display = "none";
      }
    } else if (btn_download_results_img) {
      const post_download_results_img = btn_download_results_img.closest(".post");
      const postDownloadResImgIndex = [...postContainer.children].indexOf(post_download_results_img);
      if (post_data[postDownloadResImgIndex][2] == 1) {
        let results_element = document.getElementsByClassName("post")[postDownloadResImgIndex].getElementsByClassName("chartCard")[0];
        results_element.style.backgroundColor = "#2c3134";
        results_element.style.borderRadius = "1em";
        html2canvas(results_element, {
          width: results_element.offsetWidth,
          height: results_element.offsetHeight,
          scrollY: 0,
          scale: 1,
        }).then((canvas) => {
          let link = document.createElement("a");
          link.download = "Yes_No_Poll_Type_Results.png";
          link.href = canvas.toDataURL();
          link.click();
        });
      } else if (post_data[postDownloadResImgIndex][2] == 2) {
        let results_element = document
          .getElementsByClassName("post")
          [postDownloadResImgIndex].getElementsByClassName("rating-vote-results-inside-container")[0];
        html2canvas(results_element, {
          width: results_element.offsetWidth,
          height: results_element.offsetHeight,
          scrollY: 0,
          scale: 2,
        }).then((canvas) => {
          let link = document.createElement("a");
          link.download = "Rating_Poll_Type_Results.png";
          link.href = canvas.toDataURL();
          link.click();
        });
      } else if (post_data[postDownloadResImgIndex][2] == 3) {
        let results_element = document
          .getElementsByClassName("post")
          [postDownloadResImgIndex].getElementsByClassName("approval-vote-results-inside-container")[0];
        html2canvas(results_element, {
          width: results_element.offsetWidth,
          height: results_element.offsetHeight,
          scrollY: 0,
          scale: 2,
        }).then((canvas) => {
          let link = document.createElement("a");
          link.download = "Approval_Poll_Type_Results.png";
          link.href = canvas.toDataURL();
          link.click();
        });
      }
    } else if (btn_download_results_pdf) {
      const post_download_results_pdf = btn_download_results_pdf.closest(".post");
      const postDownloadResPDFIndex = [...postContainer.children].indexOf(post_download_results_pdf);
      if (post_data[postDownloadResPDFIndex][2] == 1) {
        window.jsPDF = window.jspdf.jsPDF;
        let results_element = document.getElementsByClassName("post")[postDownloadResPDFIndex].getElementsByClassName("chartCard")[0];
        results_element.style.backgroundColor = "#2c3134";
        results_element.style.borderRadius = "1em";
        html2canvas(results_element).then((canvas) => {
          let pdf = new jsPDF("l", "mm", "a4");
          let pdfWidth = pdf.internal.pageSize.getWidth();
          let pdfHeight = pdf.internal.pageSize.getHeight();
          let chartWidth = canvas.width;
          let chartHeight = canvas.height;
          let scale = Math.min(pdfWidth / chartWidth, pdfHeight / chartHeight);
          let scaledWidth = chartWidth * scale;
          let scaledHeight = chartHeight * scale;
          pdf.addImage(canvas, "PNG", (pdfWidth - scaledWidth) / 2, (pdfHeight - scaledHeight) / 2, scaledWidth, scaledHeight);
          pdf.save("Yes_No_Poll_Type_Results.pdf");
        });
      } else if (post_data[postDownloadResPDFIndex][2] == 2) {
        window.jsPDF = window.jspdf.jsPDF;
        let results_element = document
          .getElementsByClassName("post")
          [postDownloadResPDFIndex].getElementsByClassName("rating-vote-results-inside-container")[0];
        let rating_vote_results_pdf = new jsPDF("p", "pt", [results_element.offsetWidth, results_element.offsetHeight]);
        html2canvas(results_element, { scale: 3 }).then((canvas) => {
          let padding = 10;
          let scale = Math.min(
            (rating_vote_results_pdf.internal.pageSize.width - padding) / canvas.width,
            (rating_vote_results_pdf.internal.pageSize.height - padding) / canvas.height
          );
          let x = (rating_vote_results_pdf.internal.pageSize.width - canvas.width * scale) / 2;
          let y = (rating_vote_results_pdf.internal.pageSize.height - canvas.height * scale) / 2;
          rating_vote_results_pdf.addImage(canvas.toDataURL("image/png"), "PNG", x, y, canvas.width * scale, canvas.height * scale);
          rating_vote_results_pdf.save("Rating_Poll_Type_Results.pdf");
        });
      } else if (post_data[postDownloadResPDFIndex][2] == 3) {
        window.jsPDF = window.jspdf.jsPDF;
        let results_element = document
          .getElementsByClassName("post")
          [postDownloadResPDFIndex].getElementsByClassName("approval-vote-results-inside-container")[0];
        let approval_vote_results_pdf = new jsPDF("p", "pt", [results_element.offsetWidth, results_element.offsetHeight]);
        html2canvas(results_element, { scale: 3 }).then((canvas) => {
          let padding = 10;
          let scale = Math.min(
            (approval_vote_results_pdf.internal.pageSize.width - padding) / canvas.width,
            (approval_vote_results_pdf.internal.pageSize.height - padding) / canvas.height
          );
          let x = (approval_vote_results_pdf.internal.pageSize.width - canvas.width * scale) / 2;
          let y = (approval_vote_results_pdf.internal.pageSize.height - canvas.height * scale) / 2;
          approval_vote_results_pdf.addImage(canvas.toDataURL("image/png"), "PNG", x, y, canvas.width * scale, canvas.height * scale);
          approval_vote_results_pdf.save("Approval_Poll_Type_Results.pdf");
        });
      }
    }
    if (post_data[0].length > 15) {
      if (btn_approval_vote) {
        const post_approval_vote = btn_approval_vote.closest(".post");
        const postAprovalVote = [...postContainer.children].indexOf(post_approval_vote);
        let post_element = document.getElementsByClassName("post")[postAprovalVote];
        let value_number = parseInt(btn_approval_vote.getAttribute("value"));
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
            if (value_number % 2 == 1) {
              if (window.getComputedStyle(post_element.getElementsByClassName("approval-choice")[value_number]).color === "rgb(204, 0, 0)") {
                post_element.getElementsByClassName("approval-choice")[value_number].style.border = "0.1em solid #1a1a1b";
                post_element.getElementsByClassName("approval-choice")[value_number].style.color = "#f3f3f3";
              }
              btn_approval_vote.style.border = "0.1em solid #cc0000";
              btn_approval_vote.style.color = "#cc0000";
            } else if (value_number % 2 == 0) {
              if (window.getComputedStyle(post_element.getElementsByClassName("approval-choice")[value_number - 2]).color === "rgb(204, 0, 0)") {
                post_element.getElementsByClassName("approval-choice")[value_number - 2].style.border = "0.1em solid #1a1a1b";
                post_element.getElementsByClassName("approval-choice")[value_number - 2].style.color = "#f3f3f3";
              }
              btn_approval_vote.style.border = "0.1em solid #cc0000";
              btn_approval_vote.style.color = "#cc0000";
            }
          }
        }
      } else if (btn_approval_send) {
        const post_approval_send = btn_approval_send.closest(".post");
        const postIndexApprovalSend = [...postContainer.children].indexOf(post_approval_send);
        let post_element = document.getElementsByClassName("post")[postIndexApprovalSend];
        let votes = [];
        let pair_pos = 20 + parseInt(post_data[postIndexApprovalSend][post_data[postIndexApprovalSend].length - 1]);
        for (let i = pair_pos; i < post_data[postIndexApprovalSend].length - 1; i++) {
          if (
            window.getComputedStyle(post_element.getElementsByClassName("approval-pair")[i - pair_pos].getElementsByClassName("approval-choice")[0])
              .color === "rgb(204, 0, 0)"
          ) {
            votes.push(1);
            post_data[postIndexApprovalSend][i] = "1";
          } else if (
            window.getComputedStyle(post_element.getElementsByClassName("approval-pair")[i - pair_pos].getElementsByClassName("approval-choice")[1])
              .color === "rgb(204, 0, 0)"
          ) {
            votes.push(-1);
            post_data[postIndexApprovalSend][i] = "-1";
          } else {
            votes.push(0);
            post_data[postIndexApprovalSend][i] = "0";
          }
        }
        fetch("process_data.php", {
          method: "POST",
          body: JSON.stringify({ request: "approval_vote", votes: votes, post_id: post_data[postIndexApprovalSend][0] }),
        })
          .then((res) => res.json())
          .then((response) => {
            if (response[response.length - 1].trim() == "Success") {
              let vote_data = response;
              vote_data.pop();
              conn.send(JSON.stringify(["approval_vote", post_data[postIndexApprovalSend][0], post_data[0][16], vote_data]));
              $("#notification-container").fadeIn(300, function () {});
              document.getElementById("notification-text").innerText = "Vote Accepted\n\n You can change your vote by voting again";
              post_element.getElementsByClassName("total-votes-text")[0].innerText = "Number of Votes: " + response[response.length - 1];
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

          let temp_pos = parseInt(rating_choice) + 39;
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
          for (let i = 20; i < 40; i++) {
            if (post_data[postIndexPostStarVote][i] !== null) {
              votes.push(post_data[postIndexPostStarVote][i + 20]);
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
              if (response[61].trim() == "Success") {
                let vote_data = response;
                vote_data.pop();
                conn.send(JSON.stringify(["rating_vote", post_data[postIndexPostStarVote][0], post_data[0][16], vote_data]));
                $("#notification-container").fadeIn(300, function () {});
                document.getElementById("notification-text").innerText = "Vote Accepted\n\n You can change your vote by voting again";
                document.querySelectorAll(".total-votes-text")[postIndexPostStarVote].innerText = "Number of Votes: " + vote_data[60];
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
                  document.querySelectorAll(".total-votes-text")[postIndexYes].innerText =
                    "Number of Votes: " + (parseInt(document.querySelectorAll(".total-votes-text")[postIndexYes].textContent.match(/\d+/)) - 1);
                  post_data[postIndexYes][8] = parseInt(response[0]);
                  post_data[postIndexYes][9] = parseInt(response[1]);
                  document.querySelectorAll(".post")[postIndexYes].querySelectorAll(".answer-yes")[0].style.background = "#007e7e";
                  user_yes_no_vote[postIndexYes][0] = false;
                  if (post_data[postIndexYes][2] == 1) {
                    if (parseInt(response[0]) - parseInt(response[1]) > 0) {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].style.color = "#00ffd0";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].className = "fa-solid fa-thumbs-up";
                      document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexYes].innerText = "More Yes Answers";
                    } else if (parseInt(response[0]) - parseInt(response[1]) < 0) {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].style.color = "#cc0000";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].className = "fa-solid fa-thumbs-down";
                      document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexYes].innerText = "More No Answers";
                    } else {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].style.color = "#b5b5b5";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].className = "fa-solid fa-question";
                      document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexYes].innerText = "Tie of Yes and No Answers";
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
                      document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexYes].innerText = "More Yes Answers";
                    } else if (parseInt(response[0]) - parseInt(response[1]) < 0) {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].style.color = "#cc0000";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].className = "fa-solid fa-thumbs-down";
                      document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexYes].innerText = "More No Answers";
                    } else {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].style.color = "#b5b5b5";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].className = "fa-solid fa-question";
                      document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexYes].innerText = "Tie of Yes and No Answers";
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
                  document.querySelectorAll(".total-votes-text")[postIndexYes].innerText =
                    "Number of Votes: " + (parseInt(document.querySelectorAll(".total-votes-text")[postIndexYes].textContent.match(/\d+/)) + 1);
                  post_data[postIndexYes][8] = parseInt(response[0]);
                  post_data[postIndexYes][9] = parseInt(response[1]);
                  document.querySelectorAll(".post")[postIndexYes].querySelectorAll(".answer-yes")[0].style.background = "#00ffd0";
                  user_yes_no_vote[postIndexYes][0] = true;
                  if (post_data[postIndexYes][2] == 1) {
                    if (parseInt(response[0]) - parseInt(response[1]) > 0) {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].style.color = "#00ffd0";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].className = "fa-solid fa-thumbs-up";
                      document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexYes].innerText = "More Yes Answers";
                    } else if (parseInt(response[0]) - parseInt(response[1]) < 0) {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].style.color = "#cc0000";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].className = "fa-solid fa-thumbs-down";
                      document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexYes].innerText = "More No Answers";
                    } else {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].style.color = "#b5b5b5";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].className = "fa-solid fa-question";
                      document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexYes].innerText = "Tie of Yes and No Answers";
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
                  document.querySelectorAll(".total-votes-text")[postIndexNo].innerText =
                    "Number of Votes: " + (parseInt(document.querySelectorAll(".total-votes-text")[postIndexNo].textContent.match(/\d+/)) - 1);
                  post_data[postIndexNo][8] = parseInt(response[0]);
                  post_data[postIndexNo][9] = parseInt(response[1]);
                  document.querySelectorAll(".post")[postIndexNo].querySelectorAll(".answer-no")[0].style.background = "#007e7e";
                  user_yes_no_vote[postIndexNo][1] = false;
                  if (post_data[postIndexNo][2] == 1) {
                    if (parseInt(response[0]) - parseInt(response[1]) > 0) {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].style.color = "#00ffd0";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].className = "fa-solid fa-thumbs-up";
                      document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexNo].innerText = "More Yes Answers";
                    } else if (parseInt(response[0]) - parseInt(response[1]) < 0) {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].style.color = "#cc0000";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].className = "fa-solid fa-thumbs-down";
                      document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexNo].innerText = "More No Answers";
                    } else {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].style.color = "#b5b5b5";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].className = "fa-solid fa-question";
                      document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexNo].innerText = "Tie of Yes and No Answers";
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
                      document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexNo].innerText = "More Yes Answers";
                    } else if (parseInt(response[0]) - parseInt(response[1]) < 0) {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].style.color = "#cc0000";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].className = "fa-solid fa-thumbs-down";
                      document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexNo].innerText = "More No Answers";
                    } else {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].style.color = "#b5b5b5";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].className = "fa-solid fa-question";
                      document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexNo].innerText = "Tie of Yes and No Answers";
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
                  document.querySelectorAll(".total-votes-text")[postIndexNo].innerText =
                    "Number of Votes: " + (parseInt(document.querySelectorAll(".total-votes-text")[postIndexNo].textContent.match(/\d+/)) + 1);
                  post_data[postIndexNo][8] = parseInt(response[0]);
                  post_data[postIndexNo][9] = parseInt(response[1]);
                  document.querySelectorAll(".post")[postIndexNo].querySelectorAll(".answer-no")[0].style.background = "#cc0000";
                  user_yes_no_vote[postIndexNo][1] = true;
                  if (post_data[postIndexNo][2] == 1) {
                    if (parseInt(response[0]) - parseInt(response[1]) > 0) {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].style.color = "#00ffd0";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].className = "fa-solid fa-thumbs-up";
                      document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexNo].innerText = "More Yes Answers";
                    } else if (parseInt(response[0]) - parseInt(response[1]) < 0) {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].style.color = "#cc0000";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].className = "fa-solid fa-thumbs-down";
                      document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexNo].innerText = "More No Answers";
                    } else {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].style.color = "#b5b5b5";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].className = "fa-solid fa-question";
                      document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexNo].innerText = "Tie of Yes and No Answers";
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
      } else if (btn_delete) {
        const post_delete = btn_delete.closest(".post");
        const postIndexDelete = [...postContainer.children].indexOf(post_delete);
        if (delete_post === null) {
          delete_post = postIndexDelete;
          $("#delete-notification-container").fadeIn(300, function () {});
        } else if (delete_post === true) {
          delete_post = null;
          fetch("process_data.php", {
            method: "POST",
            body: JSON.stringify({
              request: "delete_post",
              post_id: post_data[postIndexDelete][0],
            }),
          })
            .then((res) => res.text())
            .then((response) => {
              if (response.trim() == "Success") {
                conn.send(JSON.stringify(["delete_post", post_data[postIndexDelete][0]]));
                delete_post = null;
                post_data.splice(postIndexDelete, 1);
                user_chevron_vote.splice(postIndexDelete, 1);
                user_yes_no_vote.splice(postIndexDelete, 1);
                myChart.splice(postIndexDelete, 1);
                if (post_data.length === 0) {
                  $(document.getElementsByClassName("post")[postIndexDelete]).fadeOut(300, function () {});
                } else {
                  document.getElementsByClassName("post")[postIndexDelete].remove();
                }
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
    let temp_pos = parseInt(rating_choice) + 39;
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
document.getElementsByClassName("nav-element")[5].addEventListener("click", function () {
  bookmarks_active = true;
  specific_user_posts = null;
});

//This is for when the user clicks "Home" on the left navbar.
document.getElementsByClassName("nav-element")[0].addEventListener("click", function () {
  bookmarks_active = false;
  specific_user_posts = null;
});

//This is for when the user clicks "Change Username" on the user navbar.
document.getElementsByClassName("nav-element")[6].addEventListener("click", function () {
  bookmarks_active = false;
  specific_user_posts = null;
});

//This is for when the user clicks "Change Password" on the user navbar.
document.getElementsByClassName("nav-element")[7].addEventListener("click", function () {
  bookmarks_active = false;
  specific_user_posts = null;
});

//This is for when the user clicks "Analytics" on the user navbar.
document.getElementsByClassName("nav-element")[1].addEventListener("click", function () {
  bookmarks_active = false;
  specific_user_posts = null;
});

//This is for when the user clicks "About" on the user navbar.
document.getElementsByClassName("nav-element")[2].addEventListener("click", function () {
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
      let post_element = document.getElementsByClassName("post")[post_number];
      let average_ratings_array = [];
      let rating_choice_names = [];
      let zipped = [];
      if (post_data[post_number].length > 20) {
        post_data[post_number].length = 20;
      }
      if (post_data[post_number].length === 20) {
        for (let i = 20; i < 40; i++) {
          post_data[post_number] = post_data[post_number].concat(response[i]);
        }
      }

      for (let i = 0; i < 40; i++) {
        if (i >= 20) {
          rating_choice_names.push(response[i]);
        } else {
          average_ratings_array.push(response[i]);
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

      post_element.querySelectorAll(".rating-choices-results").forEach((child) => {
        if (child.getAttribute("data-value") !== "1") {
          child.remove();
        }
      });
      for (let i = 0; i < 20; i++) {
        let max_star_position = i * 10;
        let star_limit;
        if (average_ratings_array[i] !== null) {
          let first_digit = parseFloat(average_ratings_array[i][0]);
          let average_rating = parseFloat(average_ratings_array[i]).toFixed(3);
          if (average_rating < first_digit + 0.25) {
            average_rating = parseFloat(average_ratings_array[i][0]);
          } else if (average_rating >= first_digit + 0.25 && average_rating <= first_digit + 0.5) {
            average_rating = parseFloat(average_ratings_array[i][0]) + 0.5;
          } else if (average_rating >= first_digit + 0.5 && average_rating < first_digit + 0.75) {
            average_rating = parseFloat(average_ratings_array[i][0]) + 0.5;
          } else if (average_rating >= first_digit + 0.75) {
            average_rating = parseFloat(average_ratings_array[i][0]) + 1.0;
          }
          star_limit = parseInt(average_rating * 2.0) + max_star_position;
        }
        if (rating_choice_names[i] !== null) {
          if (i !== 0) {
            let clone_rating_choices = post_element.getElementsByClassName("rating-choices-results")[0];
            let clone = clone_rating_choices.cloneNode(true);
            clone.setAttribute("data-value", i + 1);
            post_element
              .getElementsByClassName("rating-vote-results-inside-container")[0]
              .insertBefore(clone, post_element.getElementsByClassName("rating-total-votes-container")[0]);
            post_element
              .querySelectorAll(".rating-choices-results")
              [i].querySelectorAll(".half-star-container-results")
              .forEach((half_star) => (half_star.style.color = "#f3f3f3"));
            post_element.querySelectorAll(".rating-choices-results")[i].getElementsByClassName("choice-name")[0].innerText = rating_choice_names[i];
          } else {
            post_element
              .querySelectorAll(".rating-choices-results")
              [i].querySelectorAll(".half-star-container-results")
              .forEach((half_star) => (half_star.style.color = "#f3f3f3"));
            post_element.querySelectorAll(".rating-choices-results")[i].getElementsByClassName("choice-name")[0].innerText = rating_choice_names[i];
          }
          if (average_ratings_array[i] !== null) {
            for (let k = max_star_position; k < star_limit; k++) {
              post_element.getElementsByClassName("half-star-container-results")[k].style.color = "#00ffd0";
            }
          }
        }
      }
      document.getElementsByClassName("rating-total-votes-text")[post_number].innerText = "Number of Votes: " + response[40];
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
      let upper_diagonal_plus = [];
      let upper_diagonal_minus = [];
      let results_array = [];
      let results_array_pairwise = [];
      let approval_choice_names_scores = [];
      let limit = 0;
      let sim_dod = [];
      let number_of_votes = response[response.length - 1];

      function compare_by_score(a, b) {
        return a.score - b.score;
      }
      if (post_data[post_number].length > 20) {
        post_data[post_number].length = 20;
      }
      if (response.length === 10) {
        limit = 9;
        for (let i = 0; i < limit; i++) {
          if (i < 3) {
            upper_diagonal_plus.push(parseInt(response[i]));
            upper_diagonal_minus.push(parseInt(response[i]) - parseInt(response[i + 3]));
          } else if (i >= 3 && i < 6) {
            results_array.push(parseInt(response[i]));
          } else if (i >= 6) {
            approval_choice_names_scores.push({ name: response[i], score: 0 });
            sim_dod.push(0);
          }
        }
      } else if (response.length === 17) {
        limit = 16;
        for (let i = 0; i < limit; i++) {
          if (i < 6) {
            upper_diagonal_plus.push(parseInt(response[i]));
            upper_diagonal_minus.push(parseInt(response[i]) - parseInt(response[i + 6]));
          } else if (i >= 6 && i < 12) {
            results_array.push(parseInt(response[i]));
          } else if (i >= 12) {
            approval_choice_names_scores.push({ name: response[i], score: 0 });
            sim_dod.push(0);
          }
        }
      } else if (response.length === 26) {
        limit = 25;
        for (let i = 0; i < limit; i++) {
          if (i < 10) {
            upper_diagonal_plus.push(parseInt(response[i]));
            upper_diagonal_minus.push(parseInt(response[i]) - parseInt(response[i + 10]));
          } else if (i >= 10 && i < 20) {
            results_array.push(parseInt(response[i]));
          } else if (i >= 20) {
            approval_choice_names_scores.push({ name: response[i], score: 0 });
            sim_dod.push(0);
          }
        }
      } else if (response.length === 37) {
        limit = 36;
        for (let i = 0; i < limit; i++) {
          if (i < 15) {
            upper_diagonal_plus.push(parseInt(response[i]));
            upper_diagonal_minus.push(parseInt(response[i]) - parseInt(response[i + 15]));
          } else if (i >= 15 && i < 30) {
            results_array.push(parseInt(response[i]));
          } else if (i >= 30) {
            approval_choice_names_scores.push({ name: response[i], score: 0 });
            sim_dod.push(0);
          }
        }
      }

      //Create an array of objects that has every pair of choices combination as "pair" and the weight of that pair as "score"
      let pos_results_pair_up = 0;
      for (let i = 0; i < approval_choice_names_scores.length; i++) {
        for (let j = 0; j < approval_choice_names_scores.length; j++) {
          if (approval_choice_names_scores[i].name == approval_choice_names_scores[j].name) {
            results_array_pairwise.push({
              pair: approval_choice_names_scores[i].name + approval_choice_names_scores[j].name,
              score: 0,
            });
          } else {
            if (i < j) {
              results_array_pairwise.push({
                pair: approval_choice_names_scores[i].name + approval_choice_names_scores[j].name,
                score: results_array[pos_results_pair_up] / (upper_diagonal_plus[pos_results_pair_up] + upper_diagonal_minus[pos_results_pair_up]),
              });
              results_array_pairwise.push({
                pair: approval_choice_names_scores[j].name + approval_choice_names_scores[i].name,
                score: -results_array[pos_results_pair_up] / (upper_diagonal_plus[pos_results_pair_up] + upper_diagonal_minus[pos_results_pair_up]),
              });
              pos_results_pair_up++;
            }
          }
        }
      }

      //Calculate true Dodgson score for each choice
      let pos_plus = 0;
      let pos_minus = 0;
      for (let i = 0; i < approval_choice_names_scores.length; i++) {
        for (let j = 0; j < approval_choice_names_scores.length; j++) {
          if (approval_choice_names_scores[i].name == approval_choice_names_scores[j].name) {
            continue;
          } else {
            if (i < j) {
              sim_dod[i] += parseInt(upper_diagonal_minus[pos_minus]);
              pos_minus++;
            } else if (i > j) {
              sim_dod[i] += parseInt(upper_diagonal_plus[pos_plus]);
              pos_plus++;
            }
          }
        }
        approval_choice_names_scores[i].score =
          approval_choice_names_scores.length * sim_dod[i] +
          approval_choice_names_scores.length * (Math.log(approval_choice_names_scores.length) + 1);
      }
      approval_choice_names_scores.sort(compare_by_score);

      //Delete all rows and columns of results table and create new rows and columns
      post_element.getElementsByClassName("approval-results-table")[0].children[0].innerHTML = "";
      for (let i = 0; i < approval_choice_names_scores.length + 1; i++) {
        let tr = document.createElement("tr");
        post_element.getElementsByClassName("approval-results-table")[0].children[0].appendChild(tr);
        tr.setAttribute("data-value", i);
        for (let j = 0; j < approval_choice_names_scores.length + 1; j++) {
          if (i == 0 && j == 0) {
            let td = document.createElement("td");
            tr.appendChild(td);
          } else if (i == 0 && j > 0) {
            let th = document.createElement("th");
            tr.appendChild(th);
          } else if (i > 0 && j == 0) {
            let th = document.createElement("th");
            tr.appendChild(th);
          } else if (i > 0 && j > 0) {
            let td = document.createElement("td");
            tr.appendChild(td);
          }
        }
      }
      th_size();
      //Fill results table
      let pair_index = 0;
      for (let i = 0; i < approval_choice_names_scores.length + 1; i++) {
        for (let j = 0; j < approval_choice_names_scores.length + 1; j++) {
          if (i > 0 && j == 0) {
            post_element.getElementsByClassName("approval-results-table")[0].rows[i].cells[j].innerText = approval_choice_names_scores[i - 1].name;
          } else if (i == 0 && j > 0) {
            post_element.getElementsByClassName("approval-results-table")[0].rows[i].cells[j].innerText = approval_choice_names_scores[j - 1].name;
          } else if (i == j && i > 0 && j > 0) {
            post_element.getElementsByClassName("approval-results-table")[0].rows[i].cells[j].style.background = "#81F9FE";
          } else {
            pair_index = results_array_pairwise.findIndex(
              (item) =>
                item.pair ==
                post_element.getElementsByClassName("approval-results-table")[0].rows[i].cells[0].textContent +
                  post_element.getElementsByClassName("approval-results-table")[0].rows[0].cells[j].textContent
            );
            if (pair_index >= 0) {
              if (!isNaN(results_array_pairwise[pair_index].score)) {
                post_element.getElementsByClassName("approval-results-table")[0].rows[i].cells[j].style.background = number_to_color(
                  results_array_pairwise[pair_index].score.toFixed(2)
                );
              } else {
                post_element.getElementsByClassName("approval-results-table")[0].rows[i].cells[j].style.background = number_to_color(0);
              }
            }
          }
        }
      }
      post_element.getElementsByClassName("approval-total-votes-text")[0].innerText = "Number of Votes: " + number_of_votes;
    });
}

export function number_to_color(saturation) {
  const minRGB = [220, 0, 0];
  const maxRGB = [0, 220, 0];
  const midRGB = [220, 220, 0];

  let rgb = [];

  if (saturation === 0) {
    rgb = midRGB;
  } else if (saturation > 0) {
    for (let i = 0; i < 3; i++) {
      rgb[i] = Math.round((maxRGB[i] - midRGB[i]) * saturation + midRGB[i]);
    }
  } else {
    for (let i = 0; i < 3; i++) {
      rgb[i] = Math.round((minRGB[i] - midRGB[i]) * Math.abs(saturation) + midRGB[i]);
    }
  }

  // Return the RGB color as a string in the format "rgb(x, y, z)"
  return "rgb(" + rgb[0] + ", " + rgb[1] + ", " + rgb[2] + ")";
}

//Makes yes_no post chart.
export function make_yes_no_chart(post_number, chart_data) {
  if (myChart[post_number]) {
    myChart[post_number].destroy();
  }
  document.querySelectorAll(".total-votes-container")[post_number].style.display = "none";
  document.querySelectorAll(".yes-no-results-container")[post_number].style.display = "flex";
  ctx[post_number] = document.getElementsByClassName("myChart")[post_number].getContext("2d");
  myChart[post_number] = new Chart(ctx[post_number], {
    type: "bar",
    data: {
      labels: ["Yes", "No"],
      datasets: [
        {
          label: "Yes/No Results",
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
  document.getElementsByClassName("yes-no-total-votes-text")[post_number].innerText = "Number of Votes: " + (chart_data[0] + chart_data[1]);
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
  document.querySelectorAll(".yes-no-results-container").forEach((main_class) => (main_class.style.display = "none"));
  document.querySelectorAll(".myChart").forEach((main_class) => main_class.remove());
  document.querySelectorAll(".answer-yes").forEach((main_class) => main_class.remove());
  document.querySelectorAll(".answer-no").forEach((main_class) => main_class.remove());
  document.querySelectorAll(".vote").forEach((main_class) => main_class.remove());
  document.querySelectorAll(".rating-vote").forEach((main_class) => {
    main_class.style.display = "none";
  });
  document.querySelectorAll(".rating-vote-results").forEach((main_class) => {
    main_class.style.display = "none";
  });
  document.querySelectorAll(".approval-vote-container").forEach((main_class) => {
    main_class.style.display = "none";
  });
  document.querySelectorAll(".approval-pair").forEach((main_class) => {
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
  document.querySelectorAll(".post-options-inside-container").forEach((main_class) => {
    if (main_class.getElementsByClassName("post-delete")[0]) {
      main_class.getElementsByClassName("post-delete")[0].remove();
    }
    main_class.getElementsByClassName("post-event-location")[0].style.borderBottom = null;
    main_class.getElementsByClassName("post-event-location")[0].style.borderRadius = null;
  });
  document.querySelectorAll(".post-critic").forEach((element) => (element.style.marginBottom = null));
  document.querySelectorAll(".total-votes-container").forEach((element) => (element.style.display = "flex"));

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
  delete_post = null;
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
    return [bookmarks_active, specific_user_posts, your_username];
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
  if (new_post.length > 15) {
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
    post_data[position][i + 40] = votes[i];
  }
}

//Adds new bookmark data that was received from websocket.
export function edit_bookmark(position, value) {
  post_data[position][10] = value;
}

export function remove_post(post_id) {
  for (let i = 0; i < post_data.length; i++) {
    if (post_id === post_data[i][0]) {
      post_data.splice(i, 1);
      user_chevron_vote.splice(i, 1);
      user_yes_no_vote.splice(i, 1);
      myChart.splice(i, 1);
      if (post_data.length === 0) {
        $(document.getElementsByClassName("post")[i]).fadeOut(300, function () {});
      } else {
        document.getElementsByClassName("post")[i].remove();
      }
      break;
    }
  }
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

window.addEventListener("click", function (e) {
  document.querySelectorAll(".post-options-inside-container").forEach((element) => {
    if (window.getComputedStyle(element).display !== "none" && !e.target.closest(".post-options-container")) {
      element.style.display = "none";
    }
  });
});

document.getElementById("delete-yes").addEventListener("click", function () {
  if (delete_post !== null) {
    let temp_post_number = delete_post;
    delete_post = true;
    document.getElementsByClassName("post-options-inside-container")[temp_post_number].getElementsByClassName("post-delete")[0].click();
    $("#delete-notification-container").fadeOut(300, function () {});
  }
});

document.getElementById("delete-no").addEventListener("click", function () {
  delete_post = null;
  $("#delete-notification-container").fadeOut(300, function () {});
});

document.getElementById("dropdown-button").addEventListener("click", function () {
  document.getElementById("short-app-description").style.display = "none";
  document.getElementById("detailed-app-description").style.display = "block";
});

export function th_size() {
  let tableHeaders = document.getElementsByTagName("th");
  for (let i = 0; i < tableHeaders.length; i++) {
    if (window.innerWidth >= 776) {
      tableHeaders[i].style.fontSize = "0.578em";
    } else if (window.innerWidth < 776 && window.innerWidth >= 714) {
      tableHeaders[i].style.fontSize = "0.529em";
    } else if (window.innerWidth < 714 && window.innerWidth >= 653) {
      tableHeaders[i].style.fontSize = "0.48em";
    } else if (window.innerWidth < 653 && window.innerWidth >= 603) {
      tableHeaders[i].style.fontSize = "0.44em";
    } else if (window.innerWidth < 603 && window.innerWidth >= 557) {
      tableHeaders[i].style.fontSize = "0.4em";
    } else if (window.innerWidth < 557 && window.innerWidth >= 512) {
      tableHeaders[i].style.fontSize = "0.36em";
    } else if (window.innerWidth < 512 && window.innerWidth >= 466) {
      tableHeaders[i].style.fontSize = "0.32em";
    } else if (window.innerWidth < 466 && window.innerWidth >= 420) {
      tableHeaders[i].style.fontSize = "0.29em";
    }
  }
}

window.onresize = function () {
  th_size();
};
