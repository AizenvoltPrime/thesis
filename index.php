<?php
// Initialize the session
session_start();
// Include config file
require_once "new_config.php";
?>

<!DOCTYPE html>
<html lang="en">

<head>
  <title>Crowdsource</title>
  <link rel="icon" type="image/x-icon" href="images/logo.png">
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" type="text/css" href="style.css">
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.1/jquery.min.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
  <link rel="stylesheet" type="text/css" href="https://npmcdn.com/flatpickr/dist/themes/dark.css">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.2/dist/leaflet.css" integrity="sha256-sA+zWATbFveLLNqWO2gtiw3HL/lh1giY/Inf1BJ0z14=" crossorigin="" />
  <script src="https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/plugins/minMaxTimePlugin.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/luxon/3.0.4/luxon.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>
  <script src="https://unpkg.com/leaflet@1.9.2/dist/leaflet.js" integrity="sha256-o9N1jGDZrf5tS+Ft4gbIK7mYMipq9lqpVJ91xHSyKhg=" crossorigin=""></script>
  <script src=https://cdnjs.cloudflare.com/ajax/libs/d3/7.6.1/d3.min.js></script>
  <script type="module" src="index_js_scripts/index.js"></script>
  <script type="module" src="index_js_scripts/navbar.js"></script>
  <script type="module" src="index_js_scripts/filters.js"></script>
  <script type="module" src="index_js_scripts/update_data.js"></script>
  <script type="module" src="index_js_scripts/admin_analytics.js"></script>
  <script type="module" src="geojson/greece_regions.js"></script>
</head>

<body>
  <!--This div is for the three icons at the top of the page.-->
  <div class="top-row">
    <button id="sidenav-icon"><i class="fa-solid fa-bars fa-2x"></i></button>
    <button id="add-post-icon"><i class="fa-solid fa-plus fa-4x"></i></button>
    <button id="profile-icon"><i class="fa-solid fa-user fa-4x" style="color:#2c3134"></i></button>
  </div>
  <!--This div is for the left navbar icons.-->
  <div id="sidenav" class="sidenav">
    <button class="closebtn"><i class="fa-solid fa-times fa-2x"></i></button>
    <a class="nav-element"><i class="fa-solid fa-house"></i>Home</a>
  </div>
  <!--This div is for the right navbar icons.-->
  <div id="user-nav" class="user-nav">
    <button class="closeuserbtn"><i class="fa-solid fa-times fa-2x"></i></button>
    <a class="nav-element" href="login/login.php"><i class="fa-solid fa-user" style="background: -webkit-linear-gradient(200deg, #cc0000, #000); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;"></i>Login</a>
    <a class="nav-element" href="registration/registration.php"><i class="fa-solid fa-user" style="background: -webkit-linear-gradient(200deg, #cc0000, #000); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;"></i>Registration</a>
    <a class="nav-element"><i class="fa-solid fa-bookmark fa-1x"></i>Bookmarks</a>
    <a class="nav-element"><i class="fa-solid fa-user fa-1x" style="background: -webkit-linear-gradient(200deg, #cc0000, #000); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;"></i>Change Username</a>
    <a class="nav-element"><i class="fa-solid fa-lock fa-1x"></i>Change Password</a>
    <a class="nav-element"><i class="fa-solid fa-chart-simple"></i>Analytics</a>
    <a class="nav-element" href="logout.php"><i class="fa-solid fa-arrow-right-from-bracket"></i>Logout</a>
  </div>
  <!--This div is for the post filters.-->
  <div id="all-filters">
    <button id="hot"><i class="fa-solid fa-fire-flame-curved"></i>Hot</button>
    <button id="recent"><i class="fa-solid fa-sun"></i>Recent</button>
    <button id="preferred-categories"><i class="fa-solid fa-table-list"></i>Preferred Categories</button>
    <button id="filter"><i class="fa-solid fa-filter"></i>Filter</button>
    <button id="post-locations-filter"><i class="fa-sharp fa-solid fa-map-location-dot"></i>Post Locations</button>
    <button id="search"><i class="fa-solid fa-magnifying-glass"></i>Search</button>
  </div>
  <!--This div is for the search filter.-->
  <form id="search-box-container" style="display:none;">
    <textarea id="search-box" type="text" rows="1" name="search-text" maxlength="150"></textarea>
    <i class="fa-solid fa-circle-chevron-right fa-3x"></i>
  </form>
  <!--This div is for the preferred categories filter.-->
  <div id="preferred-categories-container">
    <div id="categories-container">
      <div id="category-box">
        <div class="category"><i class="fa-solid fa-basketball"></i>Sports</div>
        <div class="category"><i class="fa-solid fa-briefcase"></i>Business</div>
        <div class="category"><i class="fa-solid fa-car"></i>Cars</div>
        <div class="category"><i class="fa-solid fa-people-roof"></i>Family</div>
        <div class="category"><i class="fa-solid fa-briefcase-medical"></i>Health</div>
        <div class="category"><i class="fa-solid fa-landmark"></i>Politics</div>
        <div class="category"><i class="fa-solid fa-church"></i>Religion</div>
        <div class="category"><i class="fa-solid fa-flask"></i>Science</div>
        <div class="category"><i class="fa-solid fa-microchip"></i>Technology</div>
        <div class="category"><i class="fa-solid fa-plane"></i>Travel</div>
        <div class="category"><i class="fa-solid fa-film"></i>Entertainment</div>
      </div>
      <button id="category-button" type="button">OK</button>
    </div>
  </div>
  <!--This div is for the Filter.-->
  <div id="filters-outside-container" style="display:none;">
    <div id="filters-inside-container">
      <form id="time-filter">
        <label class="filter-instruction">Time Filter</label>
        <input id="time-filter-selector" type="datetime-local" name="time-filter-choice"></input>
        <div id="warning-time-filter-choice" style="display:none;">You must select a date range</div>
      </form>
      <div id="poll-filters-containter">
        <div class="filter-instruction">Poll Type Filter</div>
        <div id="poll-filters">
          <button class="poll-filter" name="1">Yes/No</button>
          <button class="poll-filter" name="2">Rating</button>
          <button class="poll-filter" name="3">Approval</button>
          <button class="poll-filter" name="4">Ranking</button>
        </div>
      </div>
      <form id="user-filter">
        <label class="filter-instruction">User Filter</label>
        <input id="user-filter-select" type="text" name="user-filter-choice" maxlength="16" placeholder="Type Username"></input>
      </form>
      <div id="poll-status-filter-container">
        <div class="filter-instruction">Poll Status Filter</div>
        <div id="poll-status-filter">
          <button class="poll-status" name="1">Show Open</button>
          <button class="poll-status" name="2">Show Closed</button>
        </div>
      </div>
      <div id="radius-filter-container">
        <div class="filter-instruction">Radius Filter</div>
        <div id="radius-filter">
          <label class="switch">
            <input type="checkbox" name="radius-filter-checkbox">
            <span class="slider round"></span>
          </label>
        </div>
        <div id="radius-filter-info">Enable Radius Filter to only see polls that you can participate in</div>
      </div>
      <button id="filter-button" type="button">Filter</button>
    </div>
  </div>
  <!--This div is for the Post Locations filter.-->
  <div id="post-locations-container" style="display:none;">
    <div id="post-locations-map">
      <button class="close-map"><i class="fa-solid fa-xmark"></i></i></button>
    </div>
  </div>
  <!--This div is for user notifications.-->
  <div id="notification-container">
    <div id="notification">
      <div id="notification-text"></div>
      <button id="notification-button" type="button">OK</button>
    </div>
  </div>
  <!--This div is for notifications when new post is added.-->
  <div id="bell-notification-container">
    <i class="fa-solid fa-bell">
      <div id="bell-inner-container" style="display:none;"></div>
    </i>
    <div id="bell-notification-details" style="display:none;">
      <div class="bell-notification-title"></div>
      <button class="bell-actions" style="display:none;"></button>
      <button class="bell-actions" style="display:none;">Clear notifications</button>
    </div>
  </div>
  <!--This div is for choosing a poll type to create.-->
  <div id="poll-selection">
    <div class="template-instructions-container">
      <div id="first-quetion">Choose one of the following poll types</div>
    </div>
    <button id="yes-no">Yes/No</button>
    <button id="rating">Rating</button>
    <button id="approval">Approval</button>
    <button id="ranking">Ranking</button>
  </div>
  <div id="warning-nothing-selected">You must choose a poll type</div>
  <!--This div is for users to decide how many choiced their poll will have.-->
  <div id="poll-choices-number-container" style="display:none;">
    <div id="poll-choices-number-instruction">Select number of poll choices</div>
    <select id="poll-choices">
      <option value="0">Poll Choices</option>
      <option value="1">3</option>
      <option value="2">4</option>
      <option value="3">5</option>
    </select>
  </div>
  <div id="warning-no-poll-choice-number-selected" style="display:none;">You must select a number</div>
  <!--This div is for users to fill the choices for the polls.-->
  <form id="input-poll-choices" style="display:none;"></form>
  <div id="warning-no-input-poll-choices" style="display:none;">You must fill all boxes</div>
  <!--This div is for users to decide if they want a time limit to their polls.-->
  <div id="poll-template-time-choice" style="display:none;">
    <div class="template-instructions-container">
      <div class="time-limit">Do you want to close your poll after a set time limit?</div>
    </div>
    <button id="yes-time-limit">Yes</button>
    <button id="no-time-limit">No</button>
  </div>
  <div id="warning-no-time-limit-choice" style="display:none;">You must choose to continue</div>
  <!--This form is for setting the time limit.-->
  <form id="time-choice" style="display:none;">
    <div class="template-instructions-container">
      <label class="time-limit">Select time limit</label>
    </div>
    <input id="time-limit-selector" type="datetime-local" name="time-limit-choice"></input>
    <div id="warning-no-time-limit" style="display:none;">You must set a time limit</div>
  </form>
  <!--This div is for users to decide if they want to restrict votes based on location.-->
  <div id="poll-template-location-restriction" style="display:none;">
    <div class="template-instructions-container">
      <div class="location-restriction">Do you want to put a location restriction for user votes?</div>
    </div>
    <button id="yes-location-restriction">Yes</button>
    <button id="no-location-restriction">No</button>
  </div>
  <div id="warning-no-location-restriction-choice" style="display:none;">You must choose to continue</div>
  <!--This form is for users to select the event location and the radius in which votes are allowed.-->
  <form id="location-choice" style="display:none;">
    <div class="template-instructions-container">
      <label class="location-restriction">Click on the map to select event location</label>
    </div>
    <div id="event-location-map"></div>
    <div id="warning-no-location-selected" style="display:none;">You must select a location</div>
    <div class="template-instructions-container">
      <label id="event-radius">Only users inside this radius will be allowed to vote (Default Radius is 5000 meters)</label>
    </div>
    <div id="radius-container">
      <input id="radius-number" type="text" name="radius" placeholder="Set Radius in Meters">
      <i class="fa-solid fa-circle-chevron-right fa-3x"></i>
    </div>
    <div id="warning-radius-too-small" style="display:none;">Radius must be at least 5000 meters</div>
  </form>
  <!--This div is for users to select the post category.-->
  <div id="post-category-container" style="display:none;">
    <select id="categories">
      <option value="0">Select category</option>
      <option value="1">Sports</option>
      <option value="2">Business</option>
      <option value="3">Cars</option>
      <option value="4">Entertainment</option>
      <option value="5">Family</option>
      <option value="6">Health</option>
      <option value="7">Politics</option>
      <option value="8">Religion</option>
      <option value="9">Science</option>
      <option value="10">Technology</option>
      <option value="11">Travel</option>
    </select>
  </div>
  <div id="warning-no-category-selected" style="display:none;">You must select a category</div>
  <!--This form is for users to type the poll question.-->
  <form id="poll-question" style="display:none;">
    <div id="question-instruction">Type your question</div>
    <textarea id="question" type="text" name="question-text" maxlength="150"></textarea>
  </form>
  <!--This button is used to navigate inside poll creation template.-->
  <div id="warning-empty-text-area">Textarea needs to have at least 15 characters and at most 150 characters</div>
  <button id="next-step" type="button">Next</button>
  <!--This form is for users to change their username.-->
  <form id="username-change-form" style="display:none;" name="username-change-form">
    <div>
      <i class="fa-solid fa-circle-user fa-10x"></i>
    </div>
    <div class="input-icons">
      <input type="text" name="username" class="logged-form-control" placeholder="New Username">
      <i class="fa-solid fa-user fa-2x" style="background: -webkit-linear-gradient(200deg, #cc0000, #000); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;"></i>
    </div>
    <span id="user-help"></span>
    <div class="input-icons">
      <input type="password" name="password" class="logged-form-control" placeholder="Password">
      <i class="fa-solid fa-lock fa-2x"></i>
    </div>
    <span id="pass-help"></span>
    <input id="username-change" type="button" value="Submit">
  </form>
  <!--This form is for users to change their password.-->
  <form id="password-change-form" style="display:none;" name="username-change-form">
    <div>
      <i class="fa-solid fa-circle-user fa-10x"></i>
    </div>
    <div class="input-icons">
      <input type="password" name="current-password" class="logged-form-control" placeholder="Current Password">
      <i class="fa-solid fa-lock fa-2x"></i>
    </div>
    <span id="password-help"></span>
    <div class="input-icons">
      <input type="password" name="new-password" class="logged-form-control" placeholder="New Password">
      <i class="fa-solid fa-lock fa-2x"></i>
    </div>
    <span id="passc-help"></span>
    <div class="input-icons">
      <input type="password" name="repeat-new-password" class="logged-form-control" placeholder="Repeat Password">
      <i class="fa-solid fa-lock fa-2x"></i>
    </div>
    <input id="password-change" type="button" value="Submit">
  </form>
  <!--This div is for administrators only.-->
  <div id="analytics-container" style="display:none;">
    <div id="all-analytics">
      <button id="map-analytics"><i class="fa-solid fa-map"></i>Map Analytics</button>
      <button id="chart-analytics"><i class="fa-solid fa-chart-column"></i>Chart Analytics</button>
    </div>
    <div id="admin-analytics-map"></div>
  </div>
  <div id="admin-analytics-chart-filters-container" style="display:none;">
    <div id="admin-analytics-chart-filters-inside-container">
      <form id="admin-chart-time-filter-container">
        <label class="filter-instruction">Time Filter</label>
        <input id="admin-time-filter-selector" type="datetime-local" name="admin-time-filter-choice" placeholder=""></input>
        <div id="admin-warning-time-filter-choice" style="display:none;"></div>
      </form>
      <button id="admin-filter-button" type="button">Filter</button>
    </div>
  </div>
  <div id="admin-chart-container" style="display:none;">
    <canvas id="admin-chart" style="padding:0em 0.5em 0em"></canvas>
  </div>
  <!--This div contains all the posts.-->
  <div id="posts-container">
    <div class="post">
      <div class="post-info">
        <div class="user-who-posted">
          <div style="margin-right: 0.25em;">Posted by</div>
          <div class="post-user-name"></div>
          <div style="display:flex; flex-direction:column-reverse; align-items:center; margin-right:auto">
            <div class="post-time"></div>
            <div class="post-time-detailed"></div>
          </div>
          <div class="poll-timer-container">
            <i class="fa-regular fa-clock"></i>
            <div class="poll-remaining-time"></div>
          </div>
        </div>
        <div class="user-question-answers">
          <div class="post-question"></div>
          <button data-dir="show-results" class="show-results">Show Results</button>
        </div>
      </div>
      <div class="post-critic">
        <button data-dir="up"><i class="fa-solid fa-chevron-up"></i></button>
        <div class="score"></div>
        <button data-dir="down" style="margin-right:auto;"><i class="fa-solid fa-chevron-down"></i></button>
        <i class="parent_of_check_yes_no" style="margin-right:auto;"></i>
        <button class="parent_of_bookmark" data-dir="bookmark"></button>
      </div>
      <div class="chartCard" style="display:none;"></div>
      <div class="rating-vote" style="display:none;">
        <div class="rating-choices" data-value="1">
          <div class="choice-name"></div>
          <button data-dir="star" class="half-star-container" value="0.5"><i class="fa-solid fa-star-half"></i></button>
          <button data-dir="star" class="half-star-container" value="1.0" style="transform: scaleX(-1);"><i class="fa-solid fa-star-half"></i></button>
          <button data-dir="star" class="half-star-container" value="1.5"><i class="fa-solid fa-star-half"></i></button>
          <button data-dir="star" class="half-star-container" value="2.0" style="transform: scaleX(-1);"><i class="fa-solid fa-star-half"></i></button>
          <button data-dir="star" class="half-star-container" value="2.5"><i class="fa-solid fa-star-half"></i></button>
          <button data-dir="star" class="half-star-container" value="3.0" style="transform: scaleX(-1);"><i class="fa-solid fa-star-half"></i></button>
          <button data-dir="star" class="half-star-container" value="3.5"><i class="fa-solid fa-star-half"></i></button>
          <button data-dir="star" class="half-star-container" value="4.0" style="transform: scaleX(-1);"><i class="fa-solid fa-star-half"></i></button>
          <button data-dir="star" class="half-star-container" value="4.5"><i class="fa-solid fa-star-half"></i></button>
          <button data-dir="star" class="half-star-container" value="5.0" style="transform: scaleX(-1);"><i class="fa-solid fa-star-half"></i></button>
        </div>
        <button data-dir="star-vote" class="send-rating-button">Send Vote</button>
      </div>
      <div class="rating-vote-results" style="display:none;">
        <div class="rating-choices-results" data-value="1">
          <div class="choice-name"></div>
          <button class="half-star-container-results" value="0.5"><i class="fa-solid fa-star-half"></i></button>
          <button class="half-star-container-results" value="1.0" style="transform: scaleX(-1);"><i class="fa-solid fa-star-half"></i></button>
          <button class="half-star-container-results" value="1.5"><i class="fa-solid fa-star-half"></i></button>
          <button class="half-star-container-results" value="2.0" style="transform: scaleX(-1);"><i class="fa-solid fa-star-half"></i></button>
          <button class="half-star-container-results" value="2.5"><i class="fa-solid fa-star-half"></i></button>
          <button class="half-star-container-results" value="3.0" style="transform: scaleX(-1);"><i class="fa-solid fa-star-half"></i></button>
          <button class="half-star-container-results" value="3.5"><i class="fa-solid fa-star-half"></i></button>
          <button class="half-star-container-results" value="4.0" style="transform: scaleX(-1);"><i class="fa-solid fa-star-half"></i></button>
          <button class="half-star-container-results" value="4.5"><i class="fa-solid fa-star-half"></i></button>
          <button class="half-star-container-results" value="5.0" style="transform: scaleX(-1);"><i class="fa-solid fa-star-half"></i></button>
        </div>
      </div>
      <div class="approval-vote-container" style="display:none;">
        <div class="approval-choices-container">
          <div data-dir="approval-vote" class="approval-choice" value="1"></div>
          <div data-dir="approval-vote" class="approval-choice" value="2"></div>
          <div data-dir="approval-vote" class="approval-choice" value="3"></div>
        </div>
        <button data-dir="approval-vote-send" class="send-approval-button">Send Vote</button>
      </div>
      <div class="approval-vote-results" style="display:none;">
        <table class="approval-results-table">
          <tbody>
            <tr data-value="0">
              <th>Choices</th>
              <th>Votes</th>
            </tr>
            <tr data-value="1">
              <td></td>
              <td>
              </td>
            </tr>
            <tr data-value="2">
              <td>
              </td>
              <td></td>
            </tr>
            <tr data-value="3">
              <td>
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
</body>

</html>