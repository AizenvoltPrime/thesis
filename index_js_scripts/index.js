import { null_style, clear_filters } from "./filters.js";
import { clear_bell_counter } from "./update_data.js";
import { translator } from "./translate.js";

let user_choice = "none"; //poll choice
let specific_user_posts = null; //this is for showing posts of a specified user
let question_choice = "none"; //yes/no response choices
let template_status = "0"; //used to navigate through poll templates
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
let question_text; //poll question text
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
              document.getElementById("poll-question").style.display = "flex";
              document.getElementById("poll-question").style.animation = "fade_in_show 0.5s";
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
              document.getElementById("poll-question").style.display = "flex";
              document.getElementById("poll-question").style.animation = "fade_in_show 0.5s";
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
  if (template_status === "0") {
    question_text = document.forms["poll-question"]["question-text"].value;
    if ($("#question").val().trim().length < 15) {
      $("#warning-empty-text-area").fadeIn(300, function () {});
    } else if ($("#question").val().trim().length >= 1) {
      $("#warning-empty-text-area").fadeOut(300, function () {});
      $("#poll-question").fadeOut(300, function () {});
      $("#next-step").fadeOut(300, function () {});
      $("#next-step")
        .promise()
        .done(function () {
          document.getElementById("poll-selection").style.display = "flex";
          document.getElementById("poll-selection").style.animation = "fade_in_show 0.5s";
          $("#next-step").fadeIn(300, function () {});
          template_status = "1";
        });
    }
  } else if (template_status === "1") {
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
            template_status = "2";
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
              if (translator._currentLanguage === "el") {
                document.getElementById("input-poll-choices").children[i + pos].innerText = "Οι επιλογές σας μπορούν να έχουν μέχρι 50 χαρακτήρες";
              } else {
                document.getElementById("input-poll-choices").children[i + pos].innerText = "Your choices can have up to 50 characters";
              }
            }
            let new_poll_choices_instruction = document.createElement("label");
            new_poll_choices_instruction.className = "poll-choices-instruction";
            document.getElementById("input-poll-choices").appendChild(new_poll_choices_instruction);
            if (translator._currentLanguage === "el") {
              document.getElementById("input-poll-choices").children[i + pos + 1].innerText = "Επιλογή " + (i + 1);
            } else {
              document.getElementById("input-poll-choices").children[i + pos + 1].innerText = "Choice " + (i + 1);
            }

            let new_write_poll_choice = document.createElement("input");
            new_write_poll_choice.className = "write-poll-choice";
            document.getElementById("input-poll-choices").appendChild(new_write_poll_choice);
            document.getElementById("input-poll-choices").children[i + pos + 2].setAttribute("type", "text");
            document.getElementById("input-poll-choices").children[i + pos + 2].name = "poll-choice";
            document.getElementById("input-poll-choices").children[i + pos + 2].maxLength = 11;
            if (translator._currentLanguage === "el") {
              document.getElementById("input-poll-choices").children[i + pos + 2].placeholder = "Πληκτρολογήστε επιλογή " + (i + 1);
            } else {
              document.getElementById("input-poll-choices").children[i + pos + 2].placeholder = "Type choice " + (i + 1);
            }
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
    if (pass && check_for_duplicates(poll_choices) === true) {
      $("#warning-no-input-poll-choices").fadeOut(300, function () {});
      $("#notification-container").fadeIn(300, function () {});
      if (translator._currentLanguage === "el") {
        document.getElementById("notification-text").innerText = "Έχετε διπλότυπες επιλογές για τη δημοσκόπηση";
      } else {
        document.getElementById("notification-text").innerText = "You have duplicate poll choices";
      }
    } else if (pass === true) {
      $("#warning-no-input-poll-choices").fadeOut(300, function () {});
      $("#input-poll-choices").fadeOut(300, function () {});
      $("#next-step").fadeOut(300, function () {});
      $("#next-step")
        .promise()
        .done(function () {
          $("#poll-template-time-choice").fadeIn(300, function () {});
          $("#next-step").fadeIn(300, function () {});
          template_status = "2";
        });
    }
  } else if (template_status === "2") {
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
      template_status = "3";
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
          template_status = "4";
        });
    }
  } else if (template_status === "3") {
    if (time_limit === "") {
      $("#warning-no-time-limit").fadeIn(300, function () {});
    } else if (time_limit !== "") {
      $("#time-choice").fadeOut(300, function () {});
      $("#warning-no-time-limit").fadeOut(300, function () {});
      $("#next-step").fadeOut(300, function () {
        $("#poll-template-location-restriction").fadeIn(300, function () {});
        $("#next-step").fadeIn(300, function () {});
        template_status = "4";
      });
    }
  } else if (template_status === "4") {
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
      template_status = "5";
    } else if (question_choice === "no-location-restriction") {
      $("#poll-template-location-restriction").fadeOut(300, function () {});
      $("#warning-no-location-restriction-choice").fadeOut(300, function () {});
      $("#next-step").fadeOut(300, function () {
        if (translator._currentLanguage === "el") {
          document.getElementById("next-step").innerText = "Ανάρτηση";
        } else {
          document.getElementById("next-step").innerText = "Post Poll";
        }
        $("#post-category-container").fadeIn(300, function () {});
        $("#next-step").fadeIn(300, function () {});
        choice_dehighlight("no-location-restriction");
        template_status = "6";
      });
    }
  } else if (template_status === "5") {
    if (event_coordinates.length < 2) {
      $("#warning-no-location-selected").fadeIn(300, function () {});
    } else {
      $("#warning-no-location-selected").fadeOut(300, function () {});
      $("#warning-radius-too-small").fadeOut(300, function () {});
      $("#location-choice").fadeOut(300, function () {});
      $("#next-step").fadeOut(300, function () {
        if (translator._currentLanguage === "el") {
          document.getElementById("next-step").innerText = "Ανάρτηση";
        } else {
          document.getElementById("next-step").innerText = "Post Poll";
        }
        $("#post-category-container").fadeIn(300, function () {});
        $("#next-step").fadeIn(300, function () {});
        template_status = "6";
      });
    }
  } else if (template_status === "6") {
    if (post_category === "0") {
      $("#warning-no-category-selected").fadeIn(300, function () {});
    } else {
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
          $("#warning-no-category-selected").fadeOut(300, function () {});
          $("#post-category-container").fadeOut(300, function () {});
          $("#next-step").fadeOut(300, function () {
            if (translator._currentLanguage === "el") {
              document.getElementById("next-step").innerText = "Επόμενο";
            } else {
              document.getElementById("next-step").innerText = "Next";
            }
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

//Checks for duplicate strings
function check_for_duplicates(array) {
  return new Set(array).size !== array.length;
}

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
      if (response[0].length > 16) {
        if (response[response.length - 1][0] !== null) {
          translator.translatePageTo(response[response.length - 1][0]);
          if (response[response.length - 1][0] === "en") {
            document.getElementById("en").style.backgroundColor = "#00ffd0";
            localStorage.setItem("language", "en");

            document.querySelector('input[name="user-filter-choice"]').placeholder = "Type Username";
            document.querySelector('input[name="username"]').placeholder = "New Username";
            document.querySelector('input[name="password"]').placeholder = "Password";
            document.querySelector("#username-change").value = "Submit";

            document.querySelector('input[name="current-password"]').placeholder = "Current Password";
            document.querySelector('input[name="new-password"]').placeholder = "New Password";
            document.querySelector('input[name="repeat-new-password"]').placeholder = "Repeat New Password";
            document.querySelector("#password-change").value = "Submit";
          } else if (response[response.length - 1][0] === "el") {
            document.getElementById("el").style.backgroundColor = "#00ffd0";
            localStorage.setItem("language", "el");

            document.querySelector('input[name="user-filter-choice"]').placeholder = "Όνομα Χρήστη";
            document.querySelector('input[name="username"]').placeholder = "Νέο Όνομα Χρήστη";
            document.querySelector('input[name="password"]').placeholder = "Κωδικός";
            document.querySelector("#username-change").value = "Υποβολή";

            document.querySelector('input[name="current-password"]').placeholder = "Τωρινός Κωδικός";
            document.querySelector('input[name="new-password"]').placeholder = "Νέος Κωδικός";
            document.querySelector('input[name="repeat-new-password"]').placeholder = "Επαναλάβετε Νέο Κωδικό";
            document.querySelector("#password-change").value = "Υποβολή";
          }
        } else {
          if (localStorage.getItem("language") !== "el" && localStorage.getItem("language") !== "en") {
            document.getElementById("en").style.backgroundColor = "#00ffd0";
            localStorage.setItem("language", "en");

            document.querySelector('input[name="user-filter-choice"]').placeholder = "Type Username";
            document.querySelector('input[name="username"]').placeholder = "New Username";
            document.querySelector('input[name="password"]').placeholder = "Password";
            document.querySelector("#username-change").value = "Submit";

            document.querySelector('input[name="current-password"]').placeholder = "Current Password";
            document.querySelector('input[name="new-password"]').placeholder = "New Password";
            document.querySelector('input[name="repeat-new-password"]').placeholder = "Repeat New Password";
            document.querySelector("#password-change").value = "Submit";
          } else if (localStorage.getItem("language") === "el") {
            document.getElementById("el").style.backgroundColor = "#00ffd0";
            translator.translatePageTo("el");

            document.querySelector('input[name="user-filter-choice"]').placeholder = "Όνομα Χρήστη";
            document.querySelector('input[name="username"]').placeholder = "Νέο Όνομα Χρήστη";
            document.querySelector('input[name="password"]').placeholder = "Κωδικός";
            document.querySelector("#username-change").value = "Υποβολή";

            document.querySelector('input[name="current-password"]').placeholder = "Τωρινός Κωδικός";
            document.querySelector('input[name="new-password"]').placeholder = "Νέος Κωδικός";
            document.querySelector('input[name="repeat-new-password"]').placeholder = "Επαναλάβετε Νέο Κωδικό";
            document.querySelector("#password-change").value = "Υποβολή";
          } else if (localStorage.getItem("language") === "en") {
            document.getElementById("en").style.backgroundColor = "#00ffd0";
            translator.translatePageTo("en");

            document.querySelector('input[name="user-filter-choice"]').placeholder = "Type Username";
            document.querySelector('input[name="username"]').placeholder = "New Username";
            document.querySelector('input[name="password"]').placeholder = "Password";
            document.querySelector("#username-change").value = "Submit";

            document.querySelector('input[name="current-password"]').placeholder = "Current Password";
            document.querySelector('input[name="new-password"]').placeholder = "New Password";
            document.querySelector('input[name="repeat-new-password"]').placeholder = "Repeat New Password";
            document.querySelector("#password-change").value = "Submit";
          }
        }
      } else {
        if (localStorage.getItem("language") !== "el" && localStorage.getItem("language") !== "en") {
          document.getElementById("en").style.backgroundColor = "#00ffd0";
          localStorage.setItem("language", "en");

          document.querySelector('input[name="user-filter-choice"]').placeholder = "Type Username";
        } else if (localStorage.getItem("language") === "el") {
          document.getElementById("el").style.backgroundColor = "#00ffd0";
          translator.translatePageTo("el");

          document.querySelector('input[name="user-filter-choice"]').placeholder = "Όνομα Χρήστη";
        } else if (localStorage.getItem("language") === "en") {
          document.getElementById("en").style.backgroundColor = "#00ffd0";
          translator.translatePageTo("en");

          document.querySelector('input[name="user-filter-choice"]').placeholder = "Type Username";
        }
      }
      post_data.pop();
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
          if (post_data[0].length > 16) {
            if (post_data[i][2] == 1) {
              if (translator._currentLanguage === "el") {
                document.getElementsByClassName("total-votes-text")[0].innerText = "Αριθμός ψήφων: " + post_data[i][17];
              } else {
                document.getElementsByClassName("total-votes-text")[0].innerText = "Number of votes: " + post_data[i][17];
              }
            } else if (post_data[i][2] == 2) {
              if (translator._currentLanguage === "el") {
                document.getElementsByClassName("total-votes-text")[0].innerText = "Αριθμός ψήφων: " + post_data[i][18];
              } else {
                document.getElementsByClassName("total-votes-text")[0].innerText = "Number of votes: " + post_data[i][18];
              }
            } else if (post_data[i][2] == 3) {
              if (translator._currentLanguage === "el") {
                document.getElementsByClassName("total-votes-text")[0].innerText = "Αριθμός ψήφων: " + post_data[i][19];
              } else {
                document.getElementsByClassName("total-votes-text")[0].innerText = "Number of votes: " + post_data[i][19];
              }
            } else if (post_data[i][2] == 4) {
              if (translator._currentLanguage === "el") {
                document.getElementsByClassName("total-votes-text")[0].innerText = "Αριθμός ψήφων: " + post_data[i][20];
              } else {
                document.getElementsByClassName("total-votes-text")[0].innerText = "Number of votes: " + post_data[i][20];
              }
            }
          } else if (post_data[0].length <= 16) {
            if (post_data[i][2] == 1) {
              if (translator._currentLanguage === "el") {
                document.getElementsByClassName("total-votes-text")[0].innerText = "Αριθμός ψήφων: " + post_data[i][12];
              } else {
                document.getElementsByClassName("total-votes-text")[0].innerText = "Number of votes: " + post_data[i][12];
              }
            } else if (post_data[i][2] == 2) {
              if (translator._currentLanguage === "el") {
                document.getElementsByClassName("total-votes-text")[0].innerText = "Αριθμός ψήφων: " + post_data[i][13];
              } else {
                document.getElementsByClassName("total-votes-text")[0].innerText = "Number of votes: " + post_data[i][13];
              }
            } else if (post_data[i][2] == 3) {
              if (translator._currentLanguage === "el") {
                document.getElementsByClassName("total-votes-text")[0].innerText = "Αριθμός ψήφων: " + post_data[i][14];
              } else {
                document.getElementsByClassName("total-votes-text")[0].innerText = "Number of votes: " + post_data[i][14];
              }
            } else if (post_data[i][2] == 4) {
              if (translator._currentLanguage === "el") {
                document.getElementsByClassName("total-votes-text")[0].innerText = "Αριθμός ψήφων: " + post_data[i][15];
              } else {
                document.getElementsByClassName("total-votes-text")[0].innerText = "Number of votes: " + post_data[i][15];
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
          if (post_data[0].length > 16) {
            if (post_data[i][2] == 1) {
              if (translator._currentLanguage === "el") {
                clone[i - 1].querySelectorAll(".total-votes-text")[0].innerText = "Αριθμός ψήφων: " + post_data[i][17];
              } else {
                clone[i - 1].querySelectorAll(".total-votes-text")[0].innerText = "Number of votes: " + post_data[i][17];
              }
            } else if (post_data[i][2] == 2) {
              if (translator._currentLanguage === "el") {
                clone[i - 1].querySelectorAll(".total-votes-text")[0].innerText = "Αριθμός ψήφων: " + post_data[i][18];
              } else {
                clone[i - 1].querySelectorAll(".total-votes-text")[0].innerText = "Number of votes: " + post_data[i][18];
              }
            } else if (post_data[i][2] == 3) {
              if (translator._currentLanguage === "el") {
                clone[i - 1].querySelectorAll(".total-votes-text")[0].innerText = "Αριθμός ψήφων: " + post_data[i][19];
              } else {
                clone[i - 1].querySelectorAll(".total-votes-text")[0].innerText = "Number of votes: " + post_data[i][19];
              }
            } else if (post_data[i][2] == 4) {
              if (translator._currentLanguage === "el") {
                clone[i - 1].querySelectorAll(".total-votes-text")[0].innerText = "Αριθμός ψήφων: " + post_data[i][20];
              } else {
                clone[i - 1].querySelectorAll(".total-votes-text")[0].innerText = "Number of votes: " + post_data[i][20];
              }
            }
          } else if (post_data[0].length <= 16) {
            if (post_data[i][2] == 1) {
              if (translator._currentLanguage === "el") {
                clone[i - 1].querySelectorAll(".total-votes-text")[0].innerText = "Αριθμός ψήφων: " + post_data[i][12];
              } else {
                clone[i - 1].querySelectorAll(".total-votes-text")[0].innerText = "Number of votes: " + post_data[i][12];
              }
            } else if (post_data[i][2] == 2) {
              if (translator._currentLanguage === "el") {
                clone[i - 1].querySelectorAll(".total-votes-text")[0].innerText = "Αριθμός ψήφων: " + post_data[i][13];
              } else {
                clone[i - 1].querySelectorAll(".total-votes-text")[0].innerText = "Number of votes: " + post_data[i][13];
              }
            } else if (post_data[i][2] == 3) {
              if (translator._currentLanguage === "el") {
                clone[i - 1].querySelectorAll(".total-votes-text")[0].innerText = "Αριθμός ψήφων: " + post_data[i][14];
              } else {
                clone[i - 1].querySelectorAll(".total-votes-text")[0].innerText = "Number of votes: " + post_data[i][14];
              }
            } else if (post_data[i][2] == 4) {
              if (translator._currentLanguage === "el") {
                clone[i - 1].querySelectorAll(".total-votes-text")[0].innerText = "Αριθμός ψήφων: " + post_data[i][15];
              } else {
                clone[i - 1].querySelectorAll(".total-votes-text")[0].innerText = "Number of votes: " + post_data[i][15];
              }
            }
          }
          document.getElementById("posts-container").appendChild(clone[i - 1]);
        }
      }
      if (post_time !== undefined && post_time !== null) {
        if (post_data[0].length > 16) {
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
              if (translator._currentLanguage === "el") {
                new_delete_div.innerText = "Διαγραφή";
              } else {
                new_delete_div.innerText = "Delete";
              }

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
              if (translator._currentLanguage === "el") {
                new_yes_button.innerText = "Ναι";
              } else {
                new_yes_button.innerText = "Yes";
              }

              let new_no_button = document.createElement("button");
              new_no_button.className = "answer-no";
              document
                .getElementsByClassName("user-question-answers")
                [i].insertBefore(new_no_button, document.getElementsByClassName("show-results")[i]);
              new_no_button.setAttribute("data-dir", "no");
              if (translator._currentLanguage === "el") {
                new_no_button.innerText = "Όχι";
              } else {
                new_no_button.innerText = "No";
              }
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
              if (translator._currentLanguage === "el") {
                new_vote_button.innerText = "Ψηφίστε";
              } else {
                new_vote_button.innerText = "Vote";
              }
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
              if (translator._currentLanguage === "el") {
                document.querySelectorAll(".poll-remaining-time")[i].innerText =
                  "Η δημοσκόπηση κλείνει " + DateTime.fromFormat(post_data[i][11], "yyyy-MM-dd HH:mm:ss").toRelative();
              } else {
                document.querySelectorAll(".poll-remaining-time")[i].innerText =
                  "Poll closes " + DateTime.fromFormat(post_data[i][11], "yyyy-MM-dd HH:mm:ss").toRelative();
              }
              document.querySelectorAll(".poll-timer-container")[i].style.display = "flex";
              document.querySelectorAll(".fa-clock")[i].style.color = "#00ffd0";
            } else if (post_data[i][11] !== null && DateTime.fromFormat(post_data[i][11], "yyyy-MM-dd HH:mm:ss").toRelative().search("ago") !== -1) {
              if (translator._currentLanguage === "el") {
                document.querySelectorAll(".poll-remaining-time")[i].innerText =
                  "Η δημοσκόπηση έκλεισε " + DateTime.fromFormat(post_data[i][11], "yyyy-MM-dd HH:mm:ss").toRelative();
              } else {
                document.querySelectorAll(".poll-remaining-time")[i].innerText =
                  "Poll closed " + DateTime.fromFormat(post_data[i][11], "yyyy-MM-dd HH:mm:ss").toRelative();
              }
              document.querySelectorAll(".poll-timer-container")[i].style.display = "flex";
              document.querySelectorAll(".poll-timer-container")[i].style.color = "#cc0000";
            }
            if (post_data[i][15] > 0 && post_data[i][2] == 1) {
              let new_check = document.createElement("i");
              new_check.className = "fa-solid fa-thumbs-up";
              document.getElementsByClassName("parent_of_check_yes_no")[i].appendChild(new_check);
              document.getElementsByClassName("parent_of_check_yes_no")[i].children[0].style.color = "#00ffd0";
              if (translator._currentLanguage === "el") {
                document.getElementsByClassName("parent_of_check_yes_no_details")[i].innerText = "Πιο Πολλά Ναι";
              } else {
                document.getElementsByClassName("parent_of_check_yes_no_details")[i].innerText = "More Yes Answers";
              }
            } else if (post_data[i][15] < 0 && post_data[i][2] == 1) {
              let new_check = document.createElement("i");
              new_check.className = "fa-solid fa-thumbs-down";
              document.getElementsByClassName("parent_of_check_yes_no")[i].appendChild(new_check);
              document.getElementsByClassName("parent_of_check_yes_no")[i].children[0].style.color = "#cc0000";
              if (translator._currentLanguage === "el") {
                document.getElementsByClassName("parent_of_check_yes_no_details")[i].innerText = "Πιο Πολλά Όχι";
              } else {
                document.getElementsByClassName("parent_of_check_yes_no_details")[i].innerText = "More No Answers";
              }
            } else if (post_data[i][15] == 0 && post_data[i][2] == 1) {
              let new_check = document.createElement("i");
              new_check.className = "fa-solid fa-question";
              document.getElementsByClassName("parent_of_check_yes_no")[i].appendChild(new_check);
              document.getElementsByClassName("parent_of_check_yes_no")[i].children[0].style.color = "#b5b5b5";
              if (translator._currentLanguage === "el") {
                document.getElementsByClassName("parent_of_check_yes_no_details")[i].innerText = "Ισοπαλία Ναι και Όχι";
              } else {
                document.getElementsByClassName("parent_of_check_yes_no_details")[i].innerText = "Tie of Yes and No Answers";
              }
            }
            let new_canvas = document.createElement("canvas");
            new_canvas.className = "myChart";
            document
              .getElementsByClassName("chartCard")
              [i].insertBefore(new_canvas, document.getElementsByClassName("yes-no-total-votes-container")[i]);
          }
        } else if (post_data[0].length <= 16) {
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
              if (translator._currentLanguage === "el") {
                new_yes_button.innerText = "Ναι";
              } else {
                new_yes_button.innerText = "Yes";
              }

              let new_no_button = document.createElement("button");
              new_no_button.className = "answer-no";
              document
                .getElementsByClassName("user-question-answers")
                [i].insertBefore(new_no_button, document.getElementsByClassName("show-results")[i]);
              new_no_button.setAttribute("data-dir", "no");
              if (translator._currentLanguage === "el") {
                new_no_button.innerText = "Όχι";
              } else {
                new_no_button.innerText = "No";
              }
            } else if (post_data[i][2] == 2 || post_data[i][2] == 3 || post_data[i][2] == 4) {
              user_yes_no_vote.push([false, false]);
              let new_vote_button = document.createElement("button");
              new_vote_button.className = "vote";
              document
                .getElementsByClassName("user-question-answers")
                [i].insertBefore(new_vote_button, document.getElementsByClassName("show-results")[i]);
              new_vote_button.setAttribute("data-dir", "vote");
              if (translator._currentLanguage === "el") {
                new_vote_button.innerText = "Ψηφίστε";
              } else {
                new_vote_button.innerText = "Vote";
              }
            }
            if (post_data[i][7] !== null && DateTime.fromFormat(post_data[i][7], "yyyy-MM-dd HH:mm:ss").toRelative().search("ago") === -1) {
              if (translator._currentLanguage === "el") {
                document.querySelectorAll(".poll-remaining-time")[i].innerText =
                  "Η δημοσκόπηση κλείνει " + DateTime.fromFormat(post_data[i][7], "yyyy-MM-dd HH:mm:ss").toRelative();
              } else {
                document.querySelectorAll(".poll-remaining-time")[i].innerText =
                  "Poll closes " + DateTime.fromFormat(post_data[i][7], "yyyy-MM-dd HH:mm:ss").toRelative();
              }
              document.querySelectorAll(".poll-timer-container")[i].style.display = "flex";
              document.querySelectorAll(".fa-clock")[i].style.color = "#00ffd0";
            } else if (post_data[i][7] !== null && DateTime.fromFormat(post_data[i][7], "yyyy-MM-dd HH:mm:ss").toRelative().search("ago") !== -1) {
              if (translator._currentLanguage === "el") {
                document.querySelectorAll(".poll-remaining-time")[i].innerText =
                  "Η δημοσκόπηση έκλεισε " + DateTime.fromFormat(post_data[i][7], "yyyy-MM-dd HH:mm:ss").toRelative();
              } else {
                document.querySelectorAll(".poll-remaining-time")[i].innerText =
                  "Poll closed " + DateTime.fromFormat(post_data[i][7], "yyyy-MM-dd HH:mm:ss").toRelative();
              }
              document.querySelectorAll(".poll-timer-container")[i].style.display = "flex";
              document.querySelectorAll(".poll-timer-container")[i].style.color = "#cc0000";
            }
            if (post_data[i][8] > 0 && post_data[i][2] == 1) {
              let new_check = document.createElement("i");
              new_check.className = "fa-solid fa-thumbs-up";
              document.getElementsByClassName("parent_of_check_yes_no")[i].appendChild(new_check);
              document.getElementsByClassName("parent_of_check_yes_no")[i].children[0].style.color = "#00ffd0";
              if (translator._currentLanguage === "el") {
                document.getElementsByClassName("parent_of_check_yes_no_details")[i].innerText = "Πιο Πολλά Ναι";
              } else {
                document.getElementsByClassName("parent_of_check_yes_no_details")[i].innerText = "More Yes Answers";
              }
            } else if (post_data[i][8] < 0 && post_data[i][2] == 1) {
              let new_check = document.createElement("i");
              new_check.className = "fa-solid fa-thumbs-down";
              document.getElementsByClassName("parent_of_check_yes_no")[i].appendChild(new_check);
              document.getElementsByClassName("parent_of_check_yes_no")[i].children[0].style.color = "#cc0000";
              if (translator._currentLanguage === "el") {
                document.getElementsByClassName("parent_of_check_yes_no_details")[i].innerText = "Πιο Πολλά Όχι";
              } else {
                document.getElementsByClassName("parent_of_check_yes_no_details")[i].innerText = "More No Answers";
              }
            } else if (post_data[i][8] == 0 && post_data[i][2] == 1) {
              let new_check = document.createElement("i");
              new_check.className = "fa-solid fa-question";
              document.getElementsByClassName("parent_of_check_yes_no")[i].appendChild(new_check);
              document.getElementsByClassName("parent_of_check_yes_no")[i].children[0].style.color = "#b5b5b5";
              if (translator._currentLanguage === "el") {
                document.getElementsByClassName("parent_of_check_yes_no_details")[i].innerText = "Ισοπαλία Ναι και Όχι";
              } else {
                document.getElementsByClassName("parent_of_check_yes_no_details")[i].innerText = "Tie of Yes and No Answers";
              }
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
        if (translator._currentLanguage === "el") {
          document.getElementById("notification-text").innerText = "Δε βρέθηκαν αναρτήσεις";
        } else {
          document.getElementById("notification-text").innerText = "No posts found";
        }
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
    const btn_approval_vote = e.target.closest('div[data-dir="approval-vote"]');
    const btn_approval_send = e.target.closest('button[data-dir="approval-vote-send"]');
    const btn_ranking_send = e.target.closest('button[data-dir="ranking-vote-send"]');
    const btn_options = e.target.closest('div[data-dir="options"]');
    const btn_download = e.target.closest('div[data-dir="download-data"]');
    const btn_event_map = e.target.closest('div[data-dir="event-location"]');
    const btn_delete = e.target.closest('div[data-dir="delete"]');
    const btn_download_results_img = e.target.closest('button[data-dir="download-results-img"]');
    const btn_download_results_pdf = e.target.closest('button[data-dir="download-results-pdf"]');

    if (btn_vote) {
      const post_vote = btn_vote.closest(".post");
      const postIndexVote = [...postContainer.children].indexOf(post_vote);
      if (post_data[0].length > 16) {
        if (post_data[postIndexVote][1] === post_data[postIndexVote][16]) {
          $("#notification-container").fadeIn(300, function () {});
          if (translator._currentLanguage === "el") {
            document.getElementById("notification-text").innerText = "Δεν επιτρέπεται να ψηφίσετε στη δικιά σας δημοσκόπηση";
          } else {
            document.getElementById("notification-text").innerText = "You aren't allowed to vote in your own poll";
          }
        } else if (
          post_data[postIndexVote][11] !== null &&
          DateTime.fromFormat(post_data[postIndexVote][11], "yyyy-MM-dd HH:mm:ss").toRelative().search("ago") !== -1
        ) {
          $("#notification-container").fadeIn(300, function () {});
          if (translator._currentLanguage === "el") {
            document.getElementById("notification-text").innerText = "Η δημοσκόπηση έκλεισε";
          } else {
            document.getElementById("notification-text").innerText = "Poll is closed";
          }
        } else if (
          post_data[postIndexVote][12] !== null &&
          calcCrow(user_coordinates[0], user_coordinates[1], parseFloat(post_data[postIndexVote][12]), parseFloat(post_data[postIndexVote][13])) >
            parseInt(post_data[postIndexVote][14])
        ) {
          $("#notification-container").fadeIn(300, function () {});
          if (translator._currentLanguage === "el") {
            document.getElementById("notification-text").innerText =
              "Δεν επιτρέπεται να ψηφίσετε σε αυτή την ανάρτηση επειδή είστε έξω από την ακτίνα του γεγονότος";
          } else {
            document.getElementById("notification-text").innerText =
              "You aren't allowed to vote in this post because you are outside the event radius";
          }
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
                  if (post_data[postIndexVote].length > 21) {
                    post_data[postIndexVote].length = 21;
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
              fetch("process_data.php", {
                method: "POST",
                body: JSON.stringify({ request: "user_approval_vote_data", post_id: post_data[postIndexVote][0] }),
              })
                .then((res) => res.json())
                .then((response) => {
                  let post_element = document.getElementsByClassName("post")[postIndexVote];
                  if (post_data[postIndexVote].length > 21) {
                    post_data[postIndexVote].length = 21;
                  }
                  post_data[postIndexVote] = post_data[postIndexVote].concat(response);
                  post_element.querySelectorAll(".approval-choice").forEach((child) => {
                    if (child.getAttribute("value") !== "1" && child.getAttribute("value") !== "2" && child.getAttribute("value") !== "3") {
                      child.remove();
                    }
                  });
                  for (let j = 0; j < 20; j++) {
                    if (response[j] !== null) {
                      if (j > 2) {
                        let clone_approval_choices = post_element.getElementsByClassName("approval-choice")[0];
                        let clone = clone_approval_choices.cloneNode(true);
                        clone.setAttribute("value", j + 1);
                        post_element.getElementsByClassName("approval-choices-container")[0].appendChild(clone);
                        post_element.querySelectorAll(".approval-choices-container")[0].getElementsByClassName("approval-choice")[j].innerText =
                          response[j];
                      } else if (j <= 2) {
                        post_element.querySelectorAll(".approval-choices-container")[0].getElementsByClassName("approval-choice")[j].innerText =
                          response[j];
                      }
                      if (response[j + 20] === "1") {
                        post_element.getElementsByClassName("approval-choice")[j].style.border = "0.1em solid #cc0000";
                        post_element.getElementsByClassName("approval-choice")[j].style.color = "#cc0000";
                      } else if (response[j + 20] === "0") {
                        post_element.getElementsByClassName("approval-choice")[j].style.border = "0.1em solid #1a1a1b";
                        post_element.getElementsByClassName("approval-choice")[j].style.color = "#f3f3f3";
                      }
                    }
                  }
                });
            }
          } else if (post_data[postIndexVote][2] == "4") {
            if (window.getComputedStyle(document.getElementsByClassName("ranking-vote-container")[postIndexVote]).display === "flex") {
              document.querySelectorAll(".post")[postIndexVote].getElementsByClassName("vote")[0].style.backgroundColor = null;
              document.querySelectorAll(".post")[postIndexVote].getElementsByClassName("ranking-vote-container")[0].style.display = "none";
            } else {
              if (window.getComputedStyle(document.getElementsByClassName("ranking-vote-results")[postIndexVote]).display === "flex") {
                document.querySelectorAll(".show-results")[postIndexVote].style.backgroundColor = "#00a1ff80";
                document.querySelectorAll(".ranking-vote-results")[postIndexVote].style.display = "none";
              }
              document.querySelectorAll(".total-votes-container")[postIndexVote].style.display = "flex";
              document.querySelectorAll(".post")[postIndexVote].getElementsByClassName("vote")[0].style.backgroundColor = "#00ffd0";
              document.querySelectorAll(".post")[postIndexVote].getElementsByClassName("ranking-vote-container")[0].style.display = "flex";

              fetch("process_data.php", {
                method: "POST",
                body: JSON.stringify({ request: "user_ranking_vote_data", post_id: post_data[postIndexVote][0] }),
              })
                .then((res) => res.json())
                .then((response) => {
                  let post_element = document.getElementsByClassName("post")[postIndexVote].querySelectorAll(".ranking-vote-container")[0];
                  let ranking_choice_names = [];
                  let ranking_choice_results = [];
                  let empty_results = true;

                  for (let j = 0; j < 20; j++) {
                    if (response[j] !== null) {
                      ranking_choice_names.push(response[j]);
                      ranking_choice_results.push(response[j + 20]);
                    }
                  }
                  post_element.querySelectorAll(".ranking-choices").forEach((element) => {
                    if (element.getAttribute("data-value") != "1") {
                      element.remove();
                    } else {
                      element.innerHTML = "";
                    }
                  });
                  for (let j = 0; j < ranking_choice_names.length; j++) {
                    if (response[j] !== null) {
                      if (j == 0) {
                        let el_ranking_choice_name = document.createElement("div");
                        el_ranking_choice_name.className = "ranking-choice-name";
                        post_element.getElementsByClassName("ranking-choices")[j].appendChild(el_ranking_choice_name);

                        let el_choice_rank = document.createElement("select");
                        el_choice_rank.className = "choice-rank";
                        post_element.getElementsByClassName("ranking-choices")[j].appendChild(el_choice_rank);

                        post_element.getElementsByClassName("ranking-choices")[j].getElementsByClassName("ranking-choice-name")[0].innerText =
                          ranking_choice_names[j];
                        for (let k = 0; k < ranking_choice_names.length; k++) {
                          if (k == 0) {
                            let default_ranking_option = document.createElement("option");
                            if (translator._currentLanguage === "el") {
                              default_ranking_option.text = "Κατάταξη";
                            } else {
                              default_ranking_option.text = "Rank";
                            }
                            post_element.getElementsByClassName("choice-rank")[0].add(default_ranking_option, k);
                          }
                          if (ranking_choice_results[k] === null) {
                            let ranking_option = document.createElement("option");
                            ranking_option.text = k + 1;
                            post_element.getElementsByClassName("choice-rank")[0].add(ranking_option, k + 1);
                          } else if (ranking_choice_results[k] !== null) {
                            let ranking_option = document.createElement("option");
                            ranking_option.text = ranking_choice_results[k];
                            post_element
                              .getElementsByClassName("choice-rank")[0]
                              .add(ranking_option, post_element.getElementsByClassName("choice-rank")[0].length + 1);
                            empty_results = false;
                            break;
                          }
                        }
                      }
                      if (j > 0) {
                        let clone = post_element.getElementsByClassName("ranking-choices")[0].cloneNode(true);
                        clone.setAttribute("data-value", j + 1);
                        post_element.insertBefore(clone, post_element.getElementsByClassName("send-ranking-button")[0]);
                        post_element.getElementsByClassName("ranking-choices")[j].getElementsByClassName("ranking-choice-name")[0].innerText =
                          ranking_choice_names[j];
                        if (empty_results === false) {
                          post_element.getElementsByClassName("choice-rank")[0].children[1].text = ranking_choice_results[j];
                        }
                      }
                    }
                  }
                  for (let j = 0; j < ranking_choice_names.length; j++) {
                    if (ranking_choice_results[j] !== null) {
                      post_element.getElementsByClassName("choice-rank")[j].children[1].text = ranking_choice_results[j];
                      post_element.getElementsByClassName("choice-rank")[j].selectedIndex = 1;
                    }
                  }
                  let choice_rank = post_element.querySelectorAll(".choice-rank");
                  let oldValue;
                  choice_rank.forEach((select) => {
                    select.addEventListener("focus", (event) => {
                      oldValue = event.target.value;
                    });
                    select.addEventListener("change", (event) => {
                      choice_rank.forEach((otherSelect) => {
                        if (select[select.selectedIndex].text === "Rank" || select[select.selectedIndex].text === "Κατάταξη") {
                          if (!Array.from(otherSelect.options).some((option) => option.text === oldValue)) {
                            let new_option = document.createElement("option");
                            new_option.text = oldValue;
                            let index = Array.from(otherSelect.options).findIndex((option, i) => parseInt(option.text) > parseInt(oldValue) && i > 0);
                            if (index === -1) index = otherSelect.options.length;
                            otherSelect.add(new_option, index);
                          }
                        } else if (otherSelect !== select) {
                          Array.from(otherSelect.options).forEach((option) => {
                            if (option.text === select[select.selectedIndex].text) {
                              otherSelect.remove(option.index);
                            }
                          });
                          if (!Array.from(otherSelect.options).some((option) => option.text === oldValue)) {
                            let new_option = document.createElement("option");
                            new_option.text = oldValue;
                            let index = Array.from(otherSelect.options).findIndex((option, i) => parseInt(option.text) > parseInt(oldValue) && i > 0);
                            if (index === -1) index = otherSelect.options.length;
                            otherSelect.add(new_option, index);
                          }
                        }
                      });
                      oldValue = event.target.value;
                    });
                  });
                });
            }
          }
        }
      } else {
        $("#notification-container").fadeIn(300, function () {});
        if (translator._currentLanguage === "el") {
          document.getElementById("notification-text").innerText = "Πρέπει να είστε συνδεδεμένοι για να ψηφίσετε";
        } else {
          document.getElementById("notification-text").innerText = "You have to be logged-in to vote";
        }
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
      } else if (post_data[postIndexShowResults][2] == 4) {
        if (window.getComputedStyle(document.getElementsByClassName("ranking-vote-results")[postIndexShowResults]).display === "flex") {
          document.querySelectorAll(".show-results")[postIndexShowResults].style.backgroundColor = "#00a1ff80";
          document.querySelectorAll(".ranking-vote-results")[postIndexShowResults].style.display = "none";
          document.querySelectorAll(".total-votes-container")[postIndexShowResults].style.display = "flex";
          document.getElementsByClassName("post-critic")[postIndexShowResults].style.marginBottom = null;
        } else {
          if (window.getComputedStyle(document.getElementsByClassName("ranking-vote-container")[postIndexShowResults]).display === "flex") {
            document.querySelectorAll(".post")[postIndexShowResults].getElementsByClassName("vote")[0].style.backgroundColor = null;
            document.querySelectorAll(".ranking-vote-container")[postIndexShowResults].style.display = "none";
          }
          document.querySelectorAll(".total-votes-container")[postIndexShowResults].style.display = "none";
          document.querySelectorAll(".show-results")[postIndexShowResults].style.backgroundColor = "#00a1ff";
          document.querySelectorAll(".ranking-vote-results")[postIndexShowResults].style.display = "flex";
          get_ranking_data(postIndexShowResults);
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
            let approval_choice_names = [];
            let approval_choice_results = [];
            for (let i = 0; i < response.length; i++) {
              if (i < 20 && response[i + 20] !== null) {
                if (response[i] === null) {
                  approval_choice_results.push("No Votes");
                } else {
                  approval_choice_results.push(response[i]);
                }
              } else if (i >= 20 && response[i] !== null) {
                approval_choice_names.push(response[i]);
              }
            }
            const wb = XLSX.utils.book_new();
            let cell = [["Poll Text: " + post_data[postDownloadIndex][4]], approval_choice_names, approval_choice_results];
            const ws = XLSX.utils.aoa_to_sheet(cell);
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
            XLSX.writeFile(wb, "Approval_Poll_Type_Results.xlsx");
          });
      } else if (post_data[postDownloadIndex][2] == 4) {
        fetch("process_data.php", {
          method: "POST",
          body: JSON.stringify({ request: "ranking_data", post_id: post_data[postDownloadIndex][0] }),
        })
          .then((res) => res.json())
          .then((response) => {
            let ranking_choice_results = [];
            let results_array = response;
            results_array.pop();
            let ranking_choice_names = results_array[results_array.length - 1];
            results_array.pop();
            ranking_choice_names = ranking_choice_names.filter((item) => item !== null);

            let ranking_choice_names_ranks = [];
            let sim_dod = [];
            let true_dod = [];

            let pairwise_weights = [];
            for (let j = 0; j < results_array.length; j++) {
              ranking_choice_names_ranks[j] = [];
              for (let k = 0; k < ranking_choice_names.length; k++) {
                ranking_choice_names_ranks[j].push({ name: ranking_choice_names[k], rank: parseInt(results_array[j][k]) });
              }
              ranking_choice_names_ranks[j].sort((a, b) => a.rank - b.rank);
            }

            for (let j = 0; j < ranking_choice_names.length; j++) {
              sim_dod.push(0);
              true_dod.push({ name: ranking_choice_names[j], score: 0 });
              for (let other_candidate of ranking_choice_names) {
                if (ranking_choice_names[j] !== other_candidate) {
                  for (let vote of ranking_choice_names_ranks) {
                    let candidate_rank = vote.find((x) => x.name === ranking_choice_names[j]).rank;
                    let other_candidate_rank = vote.find((x) => x.name === other_candidate).rank;
                    if (candidate_rank > other_candidate_rank) {
                      sim_dod[j]++;
                    }
                  }
                }
              }
              true_dod[j].score =
                ranking_choice_names.length * sim_dod[j] + ranking_choice_names.length * (Math.log(ranking_choice_names.length) + 1);
            }
            true_dod.sort((a, b) => a.score - b.score);
            for (let j = 0; j < ranking_choice_names.length; j++) {
              for (let k = j + 1; k < ranking_choice_names.length; k++) {
                let candidateJ = ranking_choice_names[j];
                let candidateK = ranking_choice_names[k];

                let countJ = 0;
                let countK = 0;

                for (let voter of ranking_choice_names_ranks) {
                  let candidateJRank = voter.find((x) => x.name === candidateJ).rank;
                  let candidateKRank = voter.find((x) => x.name === candidateK).rank;
                  if (candidateJRank < candidateKRank) {
                    countJ++;
                  } else if (candidateJRank > candidateKRank) {
                    countK++;
                  }
                }

                pairwise_weights.push({
                  pair: [candidateJ + candidateK],
                  weight: (countJ - countK) / ranking_choice_names_ranks.length,
                });
                pairwise_weights.push({
                  pair: [candidateK + candidateJ],
                  weight: -(countJ - countK) / ranking_choice_names_ranks.length,
                });
              }
            }

            //Fill results table
            let pair_index = 0;
            let cell = [["Poll Text: " + post_data[postDownloadIndex][4]]];
            for (let j = 0; j < true_dod.length + 1; j++) {
              ranking_choice_results[j] = [];
              for (let k = 0; k < true_dod.length + 1; k++) {
                if (j > 0 && k == 0) {
                  ranking_choice_results[j][k] = true_dod[j - 1].name;
                } else if (j == 0 && k > 0) {
                  ranking_choice_results[j][k] = true_dod[k - 1].name;
                } else if (j == k && j > 0 && k > 0) {
                  ranking_choice_results[j][k] = "-";
                } else {
                  pair_index = pairwise_weights.findIndex((item) => item.pair == ranking_choice_results[j][0] + ranking_choice_results[0][k]);
                  if (pair_index >= 0) {
                    if (!isNaN(pairwise_weights[pair_index].weight)) {
                      ranking_choice_results[j][k] = pairwise_weights[pair_index].weight.toFixed(2);
                    } else {
                      ranking_choice_results[j][k] = "0";
                    }
                  }
                }
              }
              cell.push(ranking_choice_results[j]);
            }
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(cell);
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
            XLSX.writeFile(wb, "Ranking_Poll_Type_Results.xlsx");
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
      if (post_data[0].length > 16) {
        data_index_lat = 12;
        data_index_long = 13;
        data_index_radius = 14;
      } else if (post_data[0].length <= 16) {
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
        if (translator._currentLanguage === "el") {
          document.getElementById("notification-text").innerText = "Η τοποθεσία γεγονότος δεν έχει οριστεί για τη συγκεκριμένη ανάρτηση";
        } else {
          document.getElementById("notification-text").innerText = "This poll's event location hasn't been set";
        }
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
      } else if (post_data[postDownloadResImgIndex][2] == 4) {
        let results_element = document
          .getElementsByClassName("post")
          [postDownloadResImgIndex].getElementsByClassName("ranking-vote-results-inside-container")[0];
        html2canvas(results_element, {
          width: results_element.offsetWidth,
          height: results_element.offsetHeight,
          scrollY: 0,
          scale: 2,
        }).then((canvas) => {
          let link = document.createElement("a");
          link.download = "Ranking_Poll_Type_Results.png";
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
      } else if (post_data[postDownloadResPDFIndex][2] == 4) {
        window.jsPDF = window.jspdf.jsPDF;
        let results_element = document
          .getElementsByClassName("post")
          [postDownloadResPDFIndex].getElementsByClassName("ranking-vote-results-inside-container")[0];
        let ranking_vote_results_pdf = new jsPDF("p", "pt", [results_element.offsetWidth, 500]);
        html2canvas(results_element, { scale: 1 }).then((canvas) => {
          let padding = 10;
          let scale = Math.min(
            (ranking_vote_results_pdf.internal.pageSize.width - padding) / canvas.width,
            (ranking_vote_results_pdf.internal.pageSize.height - padding) / canvas.height
          );
          let x = (ranking_vote_results_pdf.internal.pageSize.width - canvas.width * scale) / 2;
          let y = (ranking_vote_results_pdf.internal.pageSize.height - canvas.height * scale) / 2;
          ranking_vote_results_pdf.addImage(canvas.toDataURL("image/png"), "PNG", x, y, canvas.width * scale, canvas.height * scale);
          ranking_vote_results_pdf.save("Ranking_Poll_Type_Results.pdf");
        });
      }
    }
    if (post_data[0].length > 16) {
      if (btn_approval_vote) {
        const post_approval_vote = btn_approval_vote.closest(".post");
        const postAprovalVote = [...postContainer.children].indexOf(post_approval_vote);

        if (
          post_data[postAprovalVote][11] !== null &&
          DateTime.fromFormat(post_data[postAprovalVote][11], "yyyy-MM-dd HH:mm:ss").toRelative().search("ago") !== -1
        ) {
          $("#notification-container").fadeIn(300, function () {});
          if (translator._currentLanguage === "el") {
            document.getElementById("notification-text").innerText = "Η δημοσκόπηση έκλεισε";
          } else {
            document.getElementById("notification-text").innerText = "Poll is closed";
          }
        } else if (
          post_data[postAprovalVote][12] !== null &&
          calcCrow(user_coordinates[0], user_coordinates[1], parseFloat(post_data[postAprovalVote][12]), parseFloat(post_data[postAprovalVote][13])) >
            parseInt(post_data[postAprovalVote][14])
        ) {
          $("#notification-container").fadeIn(300, function () {});
          if (translator._currentLanguage === "el") {
            document.getElementById("notification-text").innerText =
              "Δεν επιτρέπεται να ψηφίσετε σε αυτή την ανάρτηση επειδή είστε έξω από την ακτίνα του γεγονότος";
          } else {
            document.getElementById("notification-text").innerText =
              "You aren't allowed to vote in this post because you are outside the event radius";
          }
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
        for (let i = 21; i < 41; i++) {
          if (
            post_data[postIndexApprovalSend][i] !== null &&
            window.getComputedStyle(
              document.getElementsByClassName("approval-choices-container")[postIndexApprovalSend].getElementsByClassName("approval-choice")[i - 21]
            ).color === "rgb(204, 0, 0)"
          ) {
            votes.push(1);
            post_data[postIndexApprovalSend][i + 20] = "1";
          } else if (post_data[postIndexApprovalSend][i] !== null) {
            votes.push(0);
            post_data[postIndexApprovalSend][i + 20] = "0";
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
            if (response[response.length - 1].trim() == "Success") {
              let vote_data = response;
              vote_data.pop();
              let number_of_approval_votes = vote_data[vote_data.length - 1];
              vote_data.pop();
              conn.send(
                JSON.stringify(["approval_vote", post_data[postIndexApprovalSend][0], post_data[0][16], vote_data, number_of_approval_votes])
              );
              $("#notification-container").fadeIn(300, function () {});
              if (translator._currentLanguage === "el") {
                document.getElementById("notification-text").innerText =
                  "Η ψήφος είναι αποδεκτή\n\n Μπορείτε να αλλάξετε τη ψήφο σας ψηφίζοντας ξανά";
                document.getElementsByClassName("post")[postIndexApprovalSend].getElementsByClassName("total-votes-text")[0].innerText =
                  "Αριθμός ψήφων: " + number_of_approval_votes;
              } else {
                document.getElementById("notification-text").innerText = "Vote Accepted\n\n You can change your vote by voting again";
                document.getElementsByClassName("post")[postIndexApprovalSend].getElementsByClassName("total-votes-text")[0].innerText =
                  "Number of votes: " + number_of_approval_votes;
              }
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
          if (translator._currentLanguage === "el") {
            document.getElementById("notification-text").innerText = "Η δημοσκόπηση έκλεισε";
          } else {
            document.getElementById("notification-text").innerText = "Poll is closed";
          }
        } else if (
          post_data[postIndexStar][12] !== null &&
          calcCrow(user_coordinates[0], user_coordinates[1], parseFloat(post_data[postIndexStar][12]), parseFloat(post_data[postIndexStar][13])) >
            parseInt(post_data[postIndexStar][14])
        ) {
          $("#notification-container").fadeIn(300, function () {});
          if (translator._currentLanguage === "el") {
            document.getElementById("notification-text").innerText =
              "Δεν επιτρέπεται να ψηφίσετε σε αυτή την ανάρτηση επειδή είστε έξω από την ακτίνα του γεγονότος";
          } else {
            document.getElementById("notification-text").innerText =
              "You aren't allowed to vote in this post because you are outside the event radius";
          }
        } else {
          const rating_choice = btn_star.closest(".rating-choices").getAttribute("data-value");

          let star_range = rating_choice * 10;
          let max_star_position;
          max_star_position = star_range - 10;

          let post_index = document.querySelectorAll(".post")[postIndexStar];

          for (let i = max_star_position; i < parseInt(parseFloat(btn_star.value) * 2.0) + max_star_position; i++) {
            post_index.getElementsByClassName("half-star-container")[i].style.color = "#00ffd0";
          }

          let temp_pos = parseInt(rating_choice) + 40;
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
          if (translator._currentLanguage === "el") {
            document.getElementById("notification-text").innerText = "Η δημοσκόπηση έκλεισε";
          } else {
            document.getElementById("notification-text").innerText = "Poll is closed";
          }
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
          if (translator._currentLanguage === "el") {
            document.getElementById("notification-text").innerText =
              "Δεν επιτρέπεται να ψηφίσετε σε αυτή την ανάρτηση επειδή είστε έξω από την ακτίνα του γεγονότος";
          } else {
            document.getElementById("notification-text").innerText =
              "You aren't allowed to vote in this post because you are outside the event radius";
          }
        } else {
          let votes = [];
          for (let i = 21; i < 41; i++) {
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
                if (translator._currentLanguage === "el") {
                  document.getElementById("notification-text").innerText =
                    "Η ψήφος είναι αποδεκτή\n\n Μπορείτε να αλλάξετε τη ψήφο σας ψηφίζοντας ξανά";
                  document.querySelectorAll(".total-votes-text")[postIndexPostStarVote].innerText = "Αριθμός ψήφων: " + vote_data[60];
                } else {
                  document.getElementById("notification-text").innerText = "Vote Accepted\n\n You can change your vote by voting again";
                  document.querySelectorAll(".total-votes-text")[postIndexPostStarVote].innerText = "Number of votes: " + vote_data[60];
                }
              }
            });
        }
      } else if (btn_ranking_send) {
        const post_ranking_vote = btn_ranking_send.closest(".post");
        const postIndexRankingVote = [...postContainer.children].indexOf(post_ranking_vote);

        if (
          post_data[postIndexRankingVote][11] !== null &&
          DateTime.fromFormat(post_data[postIndexRankingVote][11], "yyyy-MM-dd HH:mm:ss").toRelative().search("ago") !== -1
        ) {
          $("#notification-container").fadeIn(300, function () {});
          if (translator._currentLanguage === "el") {
            document.getElementById("notification-text").innerText = "Η δημοσκόπηση έκλεισε";
          } else {
            document.getElementById("notification-text").innerText = "Poll is closed";
          }
        } else if (
          post_data[postIndexRankingVote][12] !== null &&
          calcCrow(
            user_coordinates[0],
            user_coordinates[1],
            parseFloat(post_data[postIndexRankingVote][12]),
            parseFloat(post_data[postIndexRankingVote][13])
          ) > parseInt(post_data[postIndexRankingVote][14])
        ) {
          $("#notification-container").fadeIn(300, function () {});
          if (translator._currentLanguage === "el") {
            document.getElementById("notification-text").innerText =
              "Δεν επιτρέπεται να ψηφίσετε σε αυτή την ανάρτηση επειδή είστε έξω από την ακτίνα του γεγονότος";
          } else {
            document.getElementById("notification-text").innerText =
              "You aren't allowed to vote in this post because you are outside the event radius";
          }
        } else {
          let post_element = document.getElementsByClassName("post")[postIndexRankingVote].querySelectorAll(".ranking-vote-container")[0];
          let votes = [];
          let send_vote = true;

          for (let j = 0; j < 20; j++) {
            if (j < post_element.getElementsByClassName("ranking-choices").length) {
              if (
                post_element.getElementsByClassName("ranking-choices")[j].getElementsByClassName("choice-rank")[0].value === "Rank" ||
                post_element.getElementsByClassName("ranking-choices")[j].getElementsByClassName("choice-rank")[0].value === "Κατάταξη"
              ) {
                send_vote = false;
                $("#notification-container").fadeIn(300, function () {});
                if (translator._currentLanguage === "el") {
                  document.getElementById("notification-text").innerText = "Πρέπει να κατατάξετε όλες τις επιλογές";
                } else {
                  document.getElementById("notification-text").innerText = "You must rank all choices";
                }
                break;
              } else {
                votes.push(post_element.getElementsByClassName("ranking-choices")[j].getElementsByClassName("choice-rank")[0].value);
              }
            } else {
              votes.push(null);
            }
          }
          if (send_vote) {
            fetch("process_data.php", {
              method: "POST",
              body: JSON.stringify({ request: "ranking_vote", votes: votes, post_id: post_data[postIndexRankingVote][0] }),
            })
              .then((res) => res.json())
              .then((response) => {
                if (response[response.length - 1][response[response.length - 1].length - 1].trim() == "Success") {
                  let vote_data = response;
                  vote_data[vote_data.length - 1].pop();
                  let user_votes = vote_data[vote_data.length - 1];
                  vote_data.pop();
                  let total_votes = user_votes[user_votes.length - 1];
                  user_votes.pop();
                  conn.send(
                    JSON.stringify(["ranking_vote", post_data[postIndexRankingVote][0], post_data[0][16], vote_data, user_votes, total_votes])
                  );
                  $("#notification-container").fadeIn(300, function () {});
                  if (translator._currentLanguage === "el") {
                    document.getElementById("notification-text").innerText =
                      "Η ψήφος είναι αποδεκτή\n\n Μπορείτε να αλλάξετε τη ψήφο σας ψηφίζοντας ξανά";
                    document.querySelectorAll(".total-votes-text")[postIndexRankingVote].innerText = "Αριθμός ψήφων: " + total_votes;
                  } else {
                    document.getElementById("notification-text").innerText = "Vote Accepted\n\n You can change your vote by voting again";
                    document.querySelectorAll(".total-votes-text")[postIndexRankingVote].innerText = "Number of votes: " + total_votes;
                  }
                }
              });
          }
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
        if (post_data[postIndexYes][1] === post_data[postIndexYes][16]) {
          $("#notification-container").fadeIn(300, function () {});
          if (translator._currentLanguage === "el") {
            document.getElementById("notification-text").innerText = "Δεν επιτρέπεται να ψηφίσετε στη δικιά σας δημοσκόπηση";
          } else {
            document.getElementById("notification-text").innerText = "You aren't allowed to vote in your own poll";
          }
        } else if (
          post_data[postIndexYes][11] !== null &&
          DateTime.fromFormat(post_data[postIndexYes][11], "yyyy-MM-dd HH:mm:ss").toRelative().search("ago") !== -1
        ) {
          $("#notification-container").fadeIn(300, function () {});
          if (translator._currentLanguage === "el") {
            document.getElementById("notification-text").innerText = "Η δημοσκόπηση έκλεισε";
          } else {
            document.getElementById("notification-text").innerText = "Poll is closed";
          }
        } else if (
          post_data[postIndexYes][12] !== null &&
          calcCrow(user_coordinates[0], user_coordinates[1], parseFloat(post_data[postIndexYes][12]), parseFloat(post_data[postIndexYes][13])) >
            parseInt(post_data[postIndexYes][14])
        ) {
          $("#notification-container").fadeIn(300, function () {});
          if (translator._currentLanguage === "el") {
            document.getElementById("notification-text").innerText =
              "Δεν επιτρέπεται να ψηφίσετε σε αυτή την ανάρτηση επειδή είστε έξω από την ακτίνα του γεγονότος";
          } else {
            document.getElementById("notification-text").innerText =
              "You aren't allowed to vote in this post because you are outside the event radius";
          }
        } else {
          if (user_yes_no_vote[postIndexYes][0] == true && user_yes_no_vote[postIndexYes][1] == false) {
            fetch("process_data.php", {
              method: "POST",
              body: JSON.stringify({ request: "yes_no_vote", current_vote: "yes", previous_vote: "yes", post_id: post_data[postIndexYes][0] }),
            })
              .then((res) => res.json())
              .then((response) => {
                if (response[2].trim() == "Success") {
                  if (translator._currentLanguage === "el") {
                    document.querySelectorAll(".total-votes-text")[postIndexYes].innerText =
                      "Αριθμός ψήφων: " + (parseInt(document.querySelectorAll(".total-votes-text")[postIndexYes].textContent.match(/\d+/)) - 1);
                  } else {
                    document.querySelectorAll(".total-votes-text")[postIndexYes].innerText =
                      "Number of votes: " + (parseInt(document.querySelectorAll(".total-votes-text")[postIndexYes].textContent.match(/\d+/)) - 1);
                  }
                  post_data[postIndexYes][8] = parseInt(response[0]);
                  post_data[postIndexYes][9] = parseInt(response[1]);
                  document.querySelectorAll(".post")[postIndexYes].querySelectorAll(".answer-yes")[0].style.background = "#007e7e";
                  user_yes_no_vote[postIndexYes][0] = false;
                  if (post_data[postIndexYes][2] == 1) {
                    if (parseInt(response[0]) - parseInt(response[1]) > 0) {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].style.color = "#00ffd0";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].className = "fa-solid fa-thumbs-up";
                      if (translator._currentLanguage === "el") {
                        document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexYes].innerText = "Πιο Πολλά Ναι";
                      } else {
                        document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexYes].innerText = "More Yes Answers";
                      }
                    } else if (parseInt(response[0]) - parseInt(response[1]) < 0) {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].style.color = "#cc0000";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].className = "fa-solid fa-thumbs-down";
                      if (translator._currentLanguage === "el") {
                        document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexYes].innerText = "Πιο Πολλά Όχι";
                      } else {
                        document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexYes].innerText = "More No Answers";
                      }
                    } else {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].style.color = "#b5b5b5";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].className = "fa-solid fa-question";
                      if (translator._currentLanguage === "el") {
                        document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexYes].innerText = "Ισοπαλία Ναι και Όχι";
                      } else {
                        document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexYes].innerText = "Tie of Yes and No Answers";
                      }
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
                      if (translator._currentLanguage === "el") {
                        document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexYes].innerText = "Πιο Πολλά Ναι";
                      } else {
                        document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexYes].innerText = "More Yes Answers";
                      }
                    } else if (parseInt(response[0]) - parseInt(response[1]) < 0) {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].style.color = "#cc0000";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].className = "fa-solid fa-thumbs-down";
                      if (translator._currentLanguage === "el") {
                        document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexYes].innerText = "Πιο Πολλά Όχι";
                      } else {
                        document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexYes].innerText = "More No Answers";
                      }
                    } else {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].style.color = "#b5b5b5";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].className = "fa-solid fa-question";
                      if (translator._currentLanguage === "el") {
                        document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexYes].innerText = "Ισοπαλία Ναι και Όχι";
                      } else {
                        document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexYes].innerText = "Tie of Yes and No Answers";
                      }
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
                  if (translator._currentLanguage === "el") {
                    document.querySelectorAll(".total-votes-text")[postIndexYes].innerText =
                      "Αριθμός ψήφων: " + (parseInt(document.querySelectorAll(".total-votes-text")[postIndexYes].textContent.match(/\d+/)) + 1);
                  } else {
                    document.querySelectorAll(".total-votes-text")[postIndexYes].innerText =
                      "Number of votes: " + (parseInt(document.querySelectorAll(".total-votes-text")[postIndexYes].textContent.match(/\d+/)) + 1);
                  }
                  post_data[postIndexYes][8] = parseInt(response[0]);
                  post_data[postIndexYes][9] = parseInt(response[1]);
                  document.querySelectorAll(".post")[postIndexYes].querySelectorAll(".answer-yes")[0].style.background = "#00ffd0";
                  user_yes_no_vote[postIndexYes][0] = true;
                  if (post_data[postIndexYes][2] == 1) {
                    if (parseInt(response[0]) - parseInt(response[1]) > 0) {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].style.color = "#00ffd0";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].className = "fa-solid fa-thumbs-up";
                      if (translator._currentLanguage === "el") {
                        document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexYes].innerText = "Πιο Πολλά Ναι";
                      } else {
                        document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexYes].innerText = "More Yes Answers";
                      }
                    } else if (parseInt(response[0]) - parseInt(response[1]) < 0) {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].style.color = "#cc0000";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].className = "fa-solid fa-thumbs-down";
                      if (translator._currentLanguage === "el") {
                        document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexYes].innerText = "Πιο Πολλά Όχι";
                      } else {
                        document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexYes].innerText = "More No Answers";
                      }
                    } else {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].style.color = "#b5b5b5";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexYes].children[0].className = "fa-solid fa-question";
                      if (translator._currentLanguage === "el") {
                        document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexYes].innerText = "Ισοπαλία Ναι και Όχι";
                      } else {
                        document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexYes].innerText = "Tie of Yes and No Answers";
                      }
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
        if (post_data[postIndexNo][1] === post_data[postIndexNo][16]) {
          $("#notification-container").fadeIn(300, function () {});
          if (translator._currentLanguage === "el") {
            document.getElementById("notification-text").innerText = "Δεν επιτρέπεται να ψηφίσετε στη δικιά σας δημοσκόπηση";
          } else {
            document.getElementById("notification-text").innerText = "You aren't allowed to vote in your own poll";
          }
        } else if (
          post_data[postIndexNo][11] !== null &&
          DateTime.fromFormat(post_data[postIndexNo][11], "yyyy-MM-dd HH:mm:ss").toRelative().search("ago") !== -1
        ) {
          $("#notification-container").fadeIn(300, function () {});
          if (translator._currentLanguage === "el") {
            document.getElementById("notification-text").innerText = "Η δημοσκόπηση έκλεισε";
          } else {
            document.getElementById("notification-text").innerText = "Poll is closed";
          }
        } else if (
          post_data[postIndexNo][12] !== null &&
          calcCrow(user_coordinates[0], user_coordinates[1], parseFloat(post_data[postIndexNo][12]), parseFloat(post_data[postIndexNo][13])) >
            parseInt(post_data[postIndexNo][14])
        ) {
          $("#notification-container").fadeIn(300, function () {});
          if (translator._currentLanguage === "el") {
            document.getElementById("notification-text").innerText =
              "Δεν επιτρέπεται να ψηφίσετε σε αυτή την ανάρτηση επειδή είστε έξω από την ακτίνα του γεγονότος";
          } else {
            document.getElementById("notification-text").innerText =
              "You aren't allowed to vote in this post because you are outside the event radius";
          }
        } else {
          if (user_yes_no_vote[postIndexNo][0] == false && user_yes_no_vote[postIndexNo][1] == true) {
            fetch("process_data.php", {
              method: "POST",
              body: JSON.stringify({ request: "yes_no_vote", current_vote: "no", previous_vote: "no", post_id: post_data[postIndexNo][0] }),
            })
              .then((res) => res.json())
              .then((response) => {
                if (response[2].trim() == "Success") {
                  if (translator._currentLanguage === "el") {
                    document.querySelectorAll(".total-votes-text")[postIndexNo].innerText =
                      "Αριθμός ψήφων: " + (parseInt(document.querySelectorAll(".total-votes-text")[postIndexNo].textContent.match(/\d+/)) - 1);
                  } else {
                    document.querySelectorAll(".total-votes-text")[postIndexNo].innerText =
                      "Number of votes: " + (parseInt(document.querySelectorAll(".total-votes-text")[postIndexNo].textContent.match(/\d+/)) - 1);
                  }
                  post_data[postIndexNo][8] = parseInt(response[0]);
                  post_data[postIndexNo][9] = parseInt(response[1]);
                  document.querySelectorAll(".post")[postIndexNo].querySelectorAll(".answer-no")[0].style.background = "#007e7e";
                  user_yes_no_vote[postIndexNo][1] = false;
                  if (post_data[postIndexNo][2] == 1) {
                    if (parseInt(response[0]) - parseInt(response[1]) > 0) {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].style.color = "#00ffd0";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].className = "fa-solid fa-thumbs-up";
                      if (translator._currentLanguage === "el") {
                        document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexNo].innerText = "Πιο Πολλά Ναι";
                      } else {
                        document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexNo].innerText = "More Yes Answers";
                      }
                    } else if (parseInt(response[0]) - parseInt(response[1]) < 0) {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].style.color = "#cc0000";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].className = "fa-solid fa-thumbs-down";
                      if (translator._currentLanguage === "el") {
                        document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexNo].innerText = "Πιο Πολλά Όχι";
                      } else {
                        document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexNo].innerText = "More No Answers";
                      }
                    } else {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].style.color = "#b5b5b5";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].className = "fa-solid fa-question";
                      if (translator._currentLanguage === "el") {
                        document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexNo].innerText = "Ισοπαλία Ναι και Όχι";
                      } else {
                        document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexNo].innerText = "Tie of Yes and No Answers";
                      }
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
                      if (translator._currentLanguage === "el") {
                        document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexNo].innerText = "Πιο Πολλά Ναι";
                      } else {
                        document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexNo].innerText = "More Yes Answers";
                      }
                    } else if (parseInt(response[0]) - parseInt(response[1]) < 0) {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].style.color = "#cc0000";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].className = "fa-solid fa-thumbs-down";
                      if (translator._currentLanguage === "el") {
                        document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexNo].innerText = "Πιο Πολλά Όχι";
                      } else {
                        document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexNo].innerText = "More No Answers";
                      }
                    } else {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].style.color = "#b5b5b5";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].className = "fa-solid fa-question";
                      if (translator._currentLanguage === "el") {
                        document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexNo].innerText = "Ισοπαλία Ναι και Όχι";
                      } else {
                        document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexNo].innerText = "Tie of Yes and No Answers";
                      }
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
                  if (translator._currentLanguage === "el") {
                    document.querySelectorAll(".total-votes-text")[postIndexNo].innerText =
                      "Αριθμός ψήφων: " + (parseInt(document.querySelectorAll(".total-votes-text")[postIndexNo].textContent.match(/\d+/)) + 1);
                  } else {
                    document.querySelectorAll(".total-votes-text")[postIndexNo].innerText =
                      "Number of votes: " + (parseInt(document.querySelectorAll(".total-votes-text")[postIndexNo].textContent.match(/\d+/)) + 1);
                  }
                  post_data[postIndexNo][8] = parseInt(response[0]);
                  post_data[postIndexNo][9] = parseInt(response[1]);
                  document.querySelectorAll(".post")[postIndexNo].querySelectorAll(".answer-no")[0].style.background = "#cc0000";
                  user_yes_no_vote[postIndexNo][1] = true;
                  if (post_data[postIndexNo][2] == 1) {
                    if (parseInt(response[0]) - parseInt(response[1]) > 0) {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].style.color = "#00ffd0";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].className = "fa-solid fa-thumbs-up";
                      if (translator._currentLanguage === "el") {
                        document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexNo].innerText = "Πιο Πολλά Ναι";
                      } else {
                        document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexNo].innerText = "More Yes Answers";
                      }
                    } else if (parseInt(response[0]) - parseInt(response[1]) < 0) {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].style.color = "#cc0000";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].className = "fa-solid fa-thumbs-down";
                      if (translator._currentLanguage === "el") {
                        document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexNo].innerText = "Πιο Πολλά Όχι";
                      } else {
                        document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexNo].innerText = "More No Answers";
                      }
                    } else {
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].style.color = "#b5b5b5";
                      document.getElementsByClassName("parent_of_check_yes_no")[postIndexNo].children[0].className = "fa-solid fa-question";
                      if (translator._currentLanguage === "el") {
                        document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexNo].innerText = "Ισοπαλία Ναι και Όχι";
                      } else {
                        document.getElementsByClassName("parent_of_check_yes_no_details")[postIndexNo].innerText = "Tie of Yes and No Answers";
                      }
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
        if (translator._currentLanguage === "el") {
          document.getElementById("notification-text").innerText = "Πρέπει να είστε συνδεδεμένοι για να κάνετε like ή dislike σε μια ανάρτηση";
        } else {
          document.getElementById("notification-text").innerText = "You have to be logged-in to like or dislike a post";
        }
      } else if (btn_yes || btn_no) {
        $("#notification-container").fadeIn(300, function () {});
        if (translator._currentLanguage === "el") {
          document.getElementById("notification-text").innerText = "Πρέπει να είστε συνδεδεμένοι για να ψηφίσετε";
        } else {
          document.getElementById("notification-text").innerText = "You have to be logged-in to vote";
        }
      } else if (btn_bookmark) {
        $("#notification-container").fadeIn(300, function () {});
        if (translator._currentLanguage === "el") {
          document.getElementById("notification-text").innerText = "Πρέπει να είστε συνδεδεμένοι για να βάλετε σελιδοδείκτη σε μια ανάρτηση";
        } else {
          document.getElementById("notification-text").innerText = "You have to be logged-in to bookmark a post";
        }
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
    let temp_pos = parseInt(rating_choice) + 40;
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
      if (post_data[post_number].length > 21) {
        post_data[post_number].length = 21;
      }
      if (post_data[post_number].length === 21) {
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
      if (translator._currentLanguage === "el") {
        document.getElementsByClassName("rating-total-votes-text")[post_number].innerText = "Αριθμός ψήφων: " + response[40];
      } else {
        document.getElementsByClassName("rating-total-votes-text")[post_number].innerText = "Number of votes: " + response[40];
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
      let results_array = [];
      let approval_choice_names = [];
      let zipped = [];
      let number_of_votes = response[response.length - 1];
      if (post_data[post_number].length > 21) {
        post_data[post_number].length = 21;
      }

      for (let i = 0; i < 40; i++) {
        if (i >= 20) {
          approval_choice_names.push(response[i]);
        } else {
          results_array.push(response[i]);
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
      make_approval_chart(post_number, approval_choice_names, results_array, number_of_votes);
    });
}

function get_ranking_data(post_number) {
  fetch("process_data.php", {
    method: "POST",
    body: JSON.stringify({ request: "ranking_data", post_id: post_data[post_number][0] }),
  })
    .then((res) => res.json())
    .then((response) => {
      let post_element = document.getElementsByClassName("post")[post_number];
      let number_of_votes = response[response.length - 1][0];
      let results_array = response;
      results_array.pop();
      let ranking_choice_names = results_array[results_array.length - 1];
      results_array.pop();
      ranking_choice_names = ranking_choice_names.filter((item) => item !== null);

      let ranking_choice_names_ranks = [];
      let sim_dod = [];
      let true_dod = [];

      let pairwise_weights = [];
      for (let j = 0; j < results_array.length; j++) {
        ranking_choice_names_ranks[j] = [];
        for (let k = 0; k < ranking_choice_names.length; k++) {
          ranking_choice_names_ranks[j].push({ name: ranking_choice_names[k], rank: parseInt(results_array[j][k]) });
        }
        ranking_choice_names_ranks[j].sort((a, b) => a.rank - b.rank);
      }

      for (let j = 0; j < ranking_choice_names.length; j++) {
        sim_dod.push(0);
        true_dod.push({ name: ranking_choice_names[j], score: 0 });
        for (let other_candidate of ranking_choice_names) {
          if (ranking_choice_names[j] !== other_candidate) {
            for (let vote of ranking_choice_names_ranks) {
              let candidate_rank = vote.find((x) => x.name === ranking_choice_names[j]).rank;
              let other_candidate_rank = vote.find((x) => x.name === other_candidate).rank;
              if (candidate_rank > other_candidate_rank) {
                sim_dod[j]++;
              }
            }
          }
        }
        true_dod[j].score = ranking_choice_names.length * sim_dod[j] + ranking_choice_names.length * (Math.log(ranking_choice_names.length) + 1);
      }
      true_dod.sort((a, b) => a.score - b.score);
      for (let j = 0; j < ranking_choice_names.length; j++) {
        for (let k = j + 1; k < ranking_choice_names.length; k++) {
          let candidateJ = ranking_choice_names[j];
          let candidateK = ranking_choice_names[k];

          let countJ = 0;
          let countK = 0;

          for (let voter of ranking_choice_names_ranks) {
            let candidateJRank = voter.find((x) => x.name === candidateJ).rank;
            let candidateKRank = voter.find((x) => x.name === candidateK).rank;
            if (candidateJRank < candidateKRank) {
              countJ++;
            } else if (candidateJRank > candidateKRank) {
              countK++;
            }
          }

          pairwise_weights.push({
            pair: [candidateJ + candidateK],
            weight: (countJ - countK) / ranking_choice_names_ranks.length,
          });
          pairwise_weights.push({
            pair: [candidateK + candidateJ],
            weight: -(countJ - countK) / ranking_choice_names_ranks.length,
          });
        }
      }

      //Delete all rows and columns of results table and create new rows and columns
      post_element.getElementsByClassName("ranking-results-table")[0].children[0].innerHTML = "";
      for (let i = 0; i < ranking_choice_names.length + 1; i++) {
        let tr = document.createElement("tr");
        post_element.getElementsByClassName("ranking-results-table")[0].children[0].appendChild(tr);
        tr.setAttribute("data-value", i);
        for (let j = 0; j < ranking_choice_names.length + 1; j++) {
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

      post_element.getElementsByClassName("ranking-results-table")[0].addEventListener("mouseover", function (e) {
        if (e.target.tagName === "TD") {
          const row = e.target.parentNode.rowIndex;
          const col = e.target.cellIndex;
          const rowHeader = post_element.getElementsByClassName("ranking-results-table")[0].rows[row].cells[0].textContent;
          const colHeader = post_element.getElementsByClassName("ranking-results-table")[0].rows[0].cells[col].textContent;
          if (translator._currentLanguage === "el") {
            e.target.title = `Όνομα Γραμμής: \n${rowHeader}\n\nΌνομα Στήλης: \n${colHeader}`;
          } else {
            e.target.title = `Row Name: \n${rowHeader}\n\nColumn Name: \n${colHeader}`;
          }
        }
      });

      post_element.getElementsByClassName("ranking-results-table")[0].addEventListener("mouseout", function (e) {
        if (e.target.tagName === "TD") {
          e.target.title = "";
          e.target.style.borderColor = "";
          e.target.style.border = null;
        }
      });

      th_size();
      //Fill results table
      let pair_index = 0;
      for (let j = 0; j < true_dod.length + 1; j++) {
        for (let k = 0; k < true_dod.length + 1; k++) {
          if (j > 0 && k == 0) {
            post_element.getElementsByClassName("ranking-results-table")[0].rows[j].cells[k].innerText = true_dod[j - 1].name;
          } else if (j == 0 && k > 0) {
            post_element.getElementsByClassName("ranking-results-table")[0].rows[j].cells[k].innerText = true_dod[k - 1].name;
          } else if (j == k && j > 0 && k > 0) {
            post_element.getElementsByClassName("ranking-results-table")[0].rows[j].cells[k].style.background = "#81F9FE";
          } else {
            pair_index = pairwise_weights.findIndex(
              (item) =>
                item.pair ==
                post_element.getElementsByClassName("ranking-results-table")[0].rows[j].cells[0].textContent +
                  post_element.getElementsByClassName("ranking-results-table")[0].rows[0].cells[k].textContent
            );
            if (pair_index >= 0) {
              if (!isNaN(pairwise_weights[pair_index].weight)) {
                post_element.getElementsByClassName("ranking-results-table")[0].rows[j].cells[k].style.background = number_to_color(
                  pairwise_weights[pair_index].weight.toFixed(2)
                );
              } else {
                post_element.getElementsByClassName("ranking-results-table")[0].rows[j].cells[k].style.background = number_to_color(0);
              }
            }
          }
        }
      }
      if (translator._currentLanguage === "el") {
        post_element.getElementsByClassName("ranking-total-votes-text")[0].innerText = "Αριθμός ψήφων: " + number_of_votes;
      } else {
        post_element.getElementsByClassName("ranking-total-votes-text")[0].innerText = "Number of votes: " + number_of_votes;
      }
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
  let chart_labels = ["Yes", "No"];
  let yes_no_label = "Yes/No Results";
  if (translator._currentLanguage === "el") {
    chart_labels = ["Ναι", "Όχι"];
    yes_no_label = "Αποτελέσματα Ναι/Όχι";
  }
  document.querySelectorAll(".total-votes-container")[post_number].style.display = "none";
  document.querySelectorAll(".yes-no-results-container")[post_number].style.display = "flex";
  ctx[post_number] = document.getElementsByClassName("myChart")[post_number].getContext("2d");
  myChart[post_number] = new Chart(ctx[post_number], {
    type: "bar",
    data: {
      labels: chart_labels,
      datasets: [
        {
          label: yes_no_label,
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
  if (translator._currentLanguage === "el") {
    document.getElementsByClassName("yes-no-total-votes-text")[post_number].innerText = "Αριθμός ψήφων: " + (chart_data[0] + chart_data[1]);
  } else {
    document.getElementsByClassName("yes-no-total-votes-text")[post_number].innerText = "Number of votes: " + (chart_data[0] + chart_data[1]);
  }
}

export function make_approval_chart(post_number, choice_names, results, number_of_votes) {
  let ctx_approval;
  let approval_chart;
  let colors = [
    "#FF5733",
    "#C70039",
    "#900C3F",
    "#581845",
    "#FFC300",
    "#DAF7A6",
    "#CC33FF",
    "#800000",
    "#808000",
    "#000080",
    "#008000",
    "#800080",
    "#808080",
    "#a52a2a",
    "#a9a9a9",
    "#adff2f",
    "#afafaf",
    "#afd700",
    "#FFAACC",
    "#CCA700",
  ];
  choice_names = choice_names.filter((item) => item !== null);
  let bar_colors = [];
  for (let i = 0; i < choice_names.length; i++) {
    bar_colors.push(colors[i]);
  }
  let approval_chart_card = document.getElementsByClassName("approval-chart-card")[post_number];
  if (approval_chart_card.getElementsByClassName("approval_bar_chart")[0]) {
    // Remove the canvas element from its parent
    approval_chart_card.removeChild(approval_chart_card.getElementsByClassName("approval_bar_chart")[0]);
  }
  let new_canvas = document.createElement("canvas");
  new_canvas.className = "approval_bar_chart";
  document
    .getElementsByClassName("approval-chart-card")
    [post_number].insertBefore(
      new_canvas,
      document.getElementsByClassName("approval-chart-card")[post_number].getElementsByClassName("approval-total-votes-container")[0]
    );
  ctx_approval = document.getElementsByClassName("approval-chart-card")[post_number].getElementsByClassName("approval_bar_chart")[0].getContext("2d");
  approval_chart = new Chart(ctx_approval, {
    type: "bar",
    data: {
      labels: choice_names,
      datasets: [
        {
          label: "",
          data: results,
          backgroundColor: [],
          borderColor: bar_colors,
          borderWidth: 1,
          hoverBackgroundColor: bar_colors,
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
  if (translator._currentLanguage === "el") {
    document.getElementsByClassName("approval-total-votes-text")[post_number].innerText = "Αριθμός ψήφων: " + number_of_votes;
  } else {
    document.getElementsByClassName("approval-total-votes-text")[post_number].innerText = "Number of votes: " + number_of_votes;
  }
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
  document.querySelectorAll(".ranking-vote-container").forEach((main_class) => {
    main_class.style.display = "none";
  });
  document.querySelectorAll(".ranking-pair").forEach((main_class) => {
    if (main_class.getAttribute("value") !== "1" && main_class.getAttribute("value") !== "2" && main_class.getAttribute("value") !== "3") {
      main_class.remove();
    } else {
      main_class.style.border = null;
      main_class.style.color = null;
    }
  });
  document.querySelectorAll(".ranking-vote-results").forEach((main_class) => {
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
  if (translator._currentLanguage === "el") {
    document.getElementById("next-step").innerText = "Επόμενο";
  } else {
    document.getElementById("next-step").innerText = "Next";
  }

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

  template_status = "0";
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
  if (new_post.length > 16) {
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
    post_data[position][i + 41] = votes[i];
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
  document.querySelectorAll(".ranking-results-table").forEach((element) => {
    if (element.getElementsByTagName("th").length > 0) {
      for (let i = 0; i < element.getElementsByTagName("th").length; i++) {
        if (window.innerWidth >= 776) {
          element.getElementsByTagName("th")[i].style.fontSize = "0.57em";
        } else if (window.innerWidth < 776 && window.innerWidth >= 714) {
          element.getElementsByTagName("th")[i].style.fontSize = "0.529em";
        } else if (window.innerWidth < 714 && window.innerWidth >= 653) {
          element.getElementsByTagName("th")[i].style.fontSize = "0.48em";
        } else if (window.innerWidth < 653 && window.innerWidth >= 603) {
          element.getElementsByTagName("th")[i].style.fontSize = "0.44em";
        } else if (window.innerWidth < 603 && window.innerWidth >= 557) {
          element.getElementsByTagName("th")[i].style.fontSize = "0.4em";
        } else if (window.innerWidth < 557 && window.innerWidth >= 512) {
          element.getElementsByTagName("th")[i].style.fontSize = "0.36em";
        } else if (window.innerWidth < 512 && window.innerWidth >= 466) {
          element.getElementsByTagName("th")[i].style.fontSize = "0.32em";
        } else if (window.innerWidth < 466 && window.innerWidth >= 420) {
          element.getElementsByTagName("th")[i].style.fontSize = "0.29em";
        }
      }
    }
  });
}

window.onresize = function () {
  th_size();
};

const style = document.createElement("style");
style.textContent = `
td {
    position: relative;
}

td:hover {
    border-color: black;
    border: 0.2em solid black;
}

td[title]:hover::after {
    content: attr(title);
    white-space: pre;
    position: absolute;
    top: 100%;
    left:-6em;
    z-index: 1;
    background-color: #2c3134;
    color:#f3f3f3;
    font-size:0.4em;
    border: 1px solid #858585;
    padding: 0.4em;
    border-radius: 1em;
    max-width: calc(100vw - 1.2em);
}
`;
document.head.appendChild(style);
