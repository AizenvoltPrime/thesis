<?php
// Initialize the session
session_start();
// Include config file
require_once "new_config.php";
?>

<!DOCTYPE html>
<html lang="en">

<head>
  <title>Check it Yourself</title>
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
  <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.6.1/d3.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
  <script src="https://unpkg.com/chart.js-plugin-labels-dv/dist/chartjs-plugin-labels.min.js"></script>
  <script lang="javascript" src="https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js"></script>
  <script src="https://unpkg.com/@andreasremdt/simple-translator@latest/dist/umd/translator.min.js"></script>
  <script type="module" src="index_js_scripts/index.js"></script>
  <script type="module" src="index_js_scripts/navbar.js"></script>
  <script type="module" src="index_js_scripts/filters.js"></script>
  <script type="module" src="index_js_scripts/update_data.js"></script>
  <script type="module" src="index_js_scripts/admin_analytics.js"></script>
  <script type="module" src="index_js_scripts/translate.js"></script>
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
    <a class="nav-element"><i class="fa-solid fa-house"></i><span data-i18n="sidenav.home">Home</span></a>
    <a class="nav-element"><i class="fa-solid fa-chart-simple"></i><span data-i18n="sidenav.analytics">Analytics</span></a>
    <a class="nav-element"><i class="fa-solid fa-info"></i><span data-i18n="sidenav.about">About</span></a>
  </div>
  <!--This div is for the right navbar icons.-->
  <div id="user-nav" class="user-nav">
    <button class="closeuserbtn"><i class="fa-solid fa-times fa-2x"></i></button>
    <a class="nav-element" href="login/login.php"><i class="fa-solid fa-user" style="background: -webkit-linear-gradient(200deg, #cc0000, #000); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;"></i><span data-i18n="usernav.login">Login</span></a>
    <a class="nav-element" href="registration/registration.php"><i class="fa-solid fa-user" style="background: -webkit-linear-gradient(200deg, #cc0000, #000); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;"></i><span data-i18n="usernav.registration">Registration</span></a>
    <a class="nav-element"><i class="fa-solid fa-bookmark fa-1x"></i><span data-i18n="usernav.bookmarks">Bookmarks</span></a>
    <a class="nav-element"><i class="fa-solid fa-user fa-1x" style="background: -webkit-linear-gradient(200deg, #cc0000, #000); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;"></i><span data-i18n="usernav.change_username">Change Username</span></a>
    <a class="nav-element"><i class="fa-solid fa-lock fa-1x"></i><span data-i18n="usernav.change_password">Change Password</span></a>
    <a class="nav-element"><i class="fa-solid fa-globe fa-1x"></i><span data-i18n="usernav.language">Language</span></a>
    <div id="language" style="display:none;">
      <div id="en">English</div>
      <div id="el">Ελληνικά</div>
    </div>
    <a class="nav-element" href="logout.php"><i class="fa-solid fa-arrow-right-from-bracket"></i><span data-i18n="usernav.logout">Logout</span></a>
  </div>
  <!--This div is for the post filters.-->
  <div id="app-title-container">
    <div id="app-title-text">Check it Yourself</div>
  </div>
  <!--This div is for the post filters.-->
  <div id="all-filters">
    <button id="hot"><i class="fa-solid fa-fire-flame-curved"></i><span data-i18n="all-filters.hot">Hot</span></button>
    <button id="recent"><i class="fa-solid fa-sun"></i><span data-i18n="all-filters.recent">Recent</button>
    <button id="preferred-categories"><i class="fa-solid fa-table-list"></i><span data-i18n="all-filters.preferred_categories">Preferred Categories</span></button>
    <button id="filter"><i class="fa-solid fa-filter"></i><span data-i18n="all-filters.filter">Filter</button>
    <button id="post-locations-filter"><i class="fa-sharp fa-solid fa-map-location-dot"></i><span data-i18n="all-filters.post_locations">Post Locations</span></button>
    <button id="search"><i class="fa-solid fa-magnifying-glass"></i><span data-i18n="all-filters.search">Search</span></button>
  </div>
  <!--This div is for the search filter.-->
  <form id="search-box-container" style="display:none;">
    <textarea id="search-box" type="text" rows="1" name="search-text" maxlength="150"></textarea>
    <i class="fa-solid fa-circle-chevron-right fa-3x"></i>
  </form>
  <!--This div is for the preferred categories filter.-->
  <div id="preferred-categories-container">
    <div id="categories-container">
      <button id="close-preferred-categories-container"><i class="fa-solid fa-xmark"></i></button>
      <div id="category-box">
        <div class="category" value="1"><i class="fa-solid fa-people-group"></i><span data-i18n="category-box.society">Society</span></div>
        <div class="category" value="2"><i class="fa-solid fa-briefcase"></i><span data-i18n="category-box.business">Business</span></div>
        <div class="category" value="3"><i class="fa-solid fa-coins"></i><span data-i18n="category-box.economy">Economy</span></div>
        <div class="category" value="4"><i class="fa-solid fa-people-roof"></i><span data-i18n="category-box.finance">Finance</span></div>
        <div class="category" value="5"><i class="fa-solid fa-cart-shopping"></i><span data-i18n="category-box.commerce">Commerce</span></div>
        <div class="category" value="6"><i class="fa-solid fa-bus"></i><span data-i18n="category-box.transportation_and_travel">Transportation and Travel</span></div>
        <div class="category" value="7"><i class="fa-solid fa-landmark"></i><span data-i18n="category-box.politics">Politics</span></div>
        <div class="category" value="8"><i class="fa-solid fa-church"></i><span data-i18n="category-box.religion">Religion</span></div>
        <div class="category" value="9"><i class="fa-solid fa-graduation-cap"></i><span data-i18n="category-box.education">Education</span></div>
        <div class="category" value="10"><i class="fa-solid fa-masks-theater"></i><span data-i18n="category-box.culture">Culture</span></div>
      </div>
      <button id="category-button" type="button">OK</button>
      <button id="category-clear" type="button"><span data-i18n="categories-container.clear">Clear</span></button>
    </div>
  </div>
  <!--This div is for the Filter.-->
  <div id="filters-outside-container" style="display:none;">
    <div id="filters-inside-container">
      <form id="time-filter">
        <label class="filter-instruction" data-i18n="time-filter.time_filter">Time Filter</label>
        <input id="time-filter-selector" type="datetime-local" name="time-filter-choice"></input>
        <div id="warning-time-filter-choice" style="display:none;" data-i18n="time-filter.warning_time_filter_choice">You must select a date range</div>
      </form>
      <div id="poll-filters-containter">
        <div class="filter-instruction" data-i18n="poll-filters-containter.poll_type_filter">Poll Type Filter</div>
        <div id="poll-filters">
          <button class="poll-filter" name="1" data-i18n="poll-filters-containter.yes_no">Yes/No</button>
          <button class="poll-filter" name="2" data-i18n="poll-filters-containter.rating">Rating</button>
          <button class="poll-filter" name="3" data-i18n="poll-filters-containter.approval">Approval</button>
          <button class="poll-filter" name="4" data-i18n="poll-filters-containter.ranking">Ranking</button>
        </div>
      </div>
      <form id="user-filter">
        <label class="filter-instruction" data-i18n="user-filter.user_filter">User Filter</label>
        <input id="user-filter-select" type="text" name="user-filter-choice" maxlength="16" placeholder="Type Username"></input>
      </form>
      <div id="poll-status-filter-container">
        <div class="filter-instruction" data-i18n="poll-status-filter-container.poll_status_filter">Poll Status Filter</div>
        <div id="poll-status-filter">
          <button class="poll-status" name="1" data-i18n="poll-status-filter-container.show_open">Show Open</button>
          <button class="poll-status" name="2" data-i18n="poll-status-filter-container.show_closed">Show Closed</button>
        </div>
      </div>
      <div id="radius-filter-container">
        <div class="filter-instruction" data-i18n="radius-filter-container.radius_filter">Radius Filter</div>
        <div id="radius-filter">
          <label class="switch">
            <input type="checkbox" name="radius-filter-checkbox">
            <span class="slider round"></span>
          </label>
        </div>
        <div id="radius-filter-info" data-i18n="radius-filter-container.radius_filter_info">Enable Radius Filter to only see polls that you can participate in</div>
      </div>
      <button id="filter-button" type="button" data-i18n="radius-filter-container.filter">Filter</button>
    </div>
  </div>
  <!--This div is for the Post Locations filter.-->
  <div id="post-locations-container" style="display:none;">
    <button id="post-locations-container-header" data-i18n="post-locations-container.post_locations_container_header">Click here to drag</button>
    <div id="post-locations-map">
      <button class="close-map"><i class="fa-solid fa-xmark"></i></button>
    </div>
  </div>
  <!--This div is for user notifications.-->
  <div id="notification-container">
    <div id="notification">
      <div id="notification-text"></div>
      <button id="notification-button" type="button">OK</button>
    </div>
  </div>
  <!--This div is for delete post notification.-->
  <div id="delete-notification-container">
    <div id="delete-notification">
      <div id="delete-notification-text" data-i18n="delete-notification-container.delete-notification-text">Are you sure you want to delete this post?</div>
      <div id="delete-notification-answer">
        <button id="delete-yes" type="button" data-i18n="delete-notification-container.yes">Yes</button>
        <button id="delete-no" type="button" data-i18n="delete-notification-container.no">No</button>
      </div>
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
      <button class="bell-actions" style="display:none;" data-i18n="bell-notification-details.clear_notifications">Clear notifications</button>
    </div>
  </div>
  <!--This div is for choosing a poll type to create.-->
  <div id="poll-selection">
    <div class="template-instructions-container">
      <div id="first-question" data-i18n="poll-selection.first_question">Choose one of the following poll types</div>
    </div>
    <button id="yes-no" data-i18n="poll-selection.yes_no">Yes/No</button>
    <div class="yes_no_details" data-i18n="poll-selection.yes_no_details">Create polls where users answer Yes/No</div>
    <button id="rating" data-i18n="poll-selection.rating">Rating</button>
    <div class="rating_details" data-i18n="poll-selection.rating_details">Create polls where users rate answers with a star rating</div>
    <button id="approval" data-i18n="poll-selection.approval">Approval</button>
    <div class="approval_details" data-i18n="poll-selection.approval_details">Create polls where users only select answers that they approve</div>
    <button id="ranking" data-i18n="poll-selection.ranking">Ranking</button>
    <div class="ranking_details" data-i18n="poll-selection.ranking_details">Create polls where users rank answers based on their preference</div>
  </div>
  <div id="warning-nothing-selected" data-i18n="warning-nothing-selected.text">You must choose a poll type</div>
  <!--This div is for users to decide how many choiced their poll will have.-->
  <div id="poll-choices-number-container" style="display:none;">
    <div id="poll-choices-number-instruction" data-i18n="poll-choices-number-container.poll_choices_number_instruction">Select number of poll choices</div>
    <select id="poll-choices">
      <option value="0" data-i18n="poll-choices-number-container.poll-choices">Poll Choices</option>
      <option value="1">3</option>
      <option value="2">4</option>
      <option value="3">5</option>
      <option value="4">6</option>
      <option value="5">7</option>
      <option value="6">8</option>
      <option value="7">9</option>
      <option value="8">10</option>
      <option value="9">11</option>
      <option value="10">12</option>
      <option value="11">13</option>
      <option value="12">14</option>
      <option value="13">15</option>
      <option value="14">16</option>
      <option value="15">17</option>
      <option value="16">18</option>
      <option value="17">19</option>
      <option value="18">20</option>
    </select>
  </div>
  <div id="warning-no-poll-choice-number-selected" style="display:none;" data-i18n="warning-no-poll-choice-number-selected.text">You must select a number</div>
  <!--This div is for users to fill the choices for the polls.-->
  <form id="input-poll-choices" style="display:none;"></form>
  <div id="warning-no-input-poll-choices" style="display:none;" data-i18n="warning-no-input-poll-choices.text">You must fill all boxes</div>
  <!--This div is for users to decide if they want a time limit to their polls.-->
  <div id="poll-template-time-choice" style="display:none;">
    <div class="template-instructions-container">
      <div class="time-limit" data-i18n="template-instructions-container.time_limit">Do you want to close your poll after a set time limit?</div>
    </div>
    <button id="yes-time-limit" data-i18n="template-instructions-container.yes">Yes</button>
    <button id="no-time-limit" data-i18n="template-instructions-container.no">No</button>
  </div>
  <div id="warning-no-time-limit-choice" style="display:none;" data-i18n="warning-no-time-limit-choice.text">You must choose to continue</div>
  <!--This form is for setting the time limit.-->
  <form id="time-choice" style="display:none;">
    <div class="template-instructions-container">
      <label class="time-limit" data-i18n="time-choice.time_limit">Select time limit</label>
    </div>
    <input id="time-limit-selector" type="datetime-local" name="time-limit-choice"></input>
    <div id="warning-no-time-limit" style="display:none;" data-i18n="time-choice.warning_no_time_limit">You must set a time limit</div>
  </form>
  <!--This div is for users to decide if they want to restrict votes based on location.-->
  <div id="poll-template-location-restriction" style="display:none;">
    <div class="template-instructions-container">
      <div class="location-restriction" data-i18n="poll-template-location-restriction.location-restriction">Do you want to put a location restriction for user votes?</div>
    </div>
    <button id="yes-location-restriction" data-i18n="poll-template-location-restriction.yes">Yes</button>
    <button id="no-location-restriction" data-i18n="poll-template-location-restriction.no">No</button>
  </div>
  <div id="warning-no-location-restriction-choice" style="display:none;" data-i18n="warning-no-location-restriction-choice.text">You must choose to continue</div>
  <!--This form is for users to select the event location and the radius in which votes are allowed.-->
  <form id="location-choice" style="display:none;">
    <div class="template-instructions-container">
      <label class="location-restriction" data-i18n="location-choice.location-restriction">Click on the map to select event location</label>
    </div>
    <div id="event-location-map"></div>
    <div id="warning-no-location-selected" style="display:none;" data-i18n="location-choice.warning-no-location-selected">You must select a location</div>
    <div class="template-instructions-container">
      <label id="event-radius" data-i18n="location-choice.event-radius">Only users inside this radius will be allowed to vote (Default Radius is 5000 meters)</label>
    </div>
    <div id=" radius-container">
      <input id="radius-number" type="text" name="radius" placeholder="Set Radius in Meters">
      <i class="fa-solid fa-circle-chevron-right fa-3x"></i>
    </div>
    <div id="warning-radius-too-small" style="display:none;" data-i18n="location-choice.warning-radius-too-small">Radius must be at least 5000 meters</div>
  </form>
  <!--This div is for users to select the post category.-->
  <div id="post-category-container" style="display:none;">
    <select id="categories">
      <option value="0" data-i18n="categories.select_category">Select category</option>
      <option value="1" data-i18n="categories.society">Society</option>
      <option value="2" data-i18n="categories.business">Business</option>
      <option value="3" data-i18n="categories.economy">Economy</option>
      <option value="4" data-i18n="categories.finance">Finance</option>
      <option value="5" data-i18n="categories.commerce">Commerce</option>
      <option value="6" data-i18n="categories.transportation_and_travel">Transportation and Travel</option>
      <option value="7" data-i18n="categories.politics">Politics</option>
      <option value="8" data-i18n="categories.religion">Religion</option>
      <option value="9" data-i18n="categories.education">Education</option>
      <option value="10" data-i18n="categories.culture">Culture</option>
    </select>
  </div>
  <div id="warning-no-category-selected" style="display:none;" data-i18n="warning-no-category-selected.text">You must select a category</div>
  <!--This form is for users to type the poll question.-->
  <form id="poll-question" style="display:none;">
    <div id="question-instruction" data-i18n="poll-question.question-instruction">Please type your question and keep in mind that after submission, edit is not allowed</div>
    <textarea id="question" type="text" name="question-text" maxlength="150"></textarea>
  </form>
  <!--This button is used to navigate inside poll creation template.-->
  <div id="warning-empty-text-area" data-i18n="warning-empty-text-area.text">Text area needs to have at least 15 characters and at most 150 characters</div>
  <button id="next-step" type="button" data-i18n="next-step.text">Next</button>
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
      <button id="map-analytics"><i class="fa-solid fa-map"></i><span data-i18n="all-analytics.map-analytics">Live User Locations</span></button>
      <button id="chart-analytics"><i class="fa-solid fa-chart-column"></i><span data-i18n="all-analytics.chart-analytics">Posts per Day/Hour</span></button>
      <button id="general-info"><i class="fa-solid fa-circle-info"></i><span data-i18n="all-analytics.general-info">General Info</span></button>
      <button id="posts-per-poll-type"><i class="fa-solid fa-chart-pie"></i><span data-i18n="all-analytics.posts-per-poll-type">Number of Posts per Poll Type</span></button>
      <button id="posts-per-category"><i class="fa-solid fa-chart-pie"></i><span data-i18n="all-analytics.posts-per-category">Number of Posts per Category</span></button>
    </div>
    <div id="admin-analytics-map"></div>
  </div>
  <!--This div is for administrators only.-->
  <div id="admin-analytics-chart-filters-container" style="display:none;">
    <div id="admin-analytics-chart-filters-inside-container">
      <form id="admin-chart-time-filter-container">
        <label class="filter-instruction" data-i18n="admin-chart-time-filter-container.filter-instruction">Time Filter</label>
        <input id="admin-time-filter-selector" type="datetime-local" name="admin-time-filter-choice" placeholder=""></input>
        <div id="admin-warning-time-filter-choice" style="display:none;"></div>
      </form>
      <button id="admin-filter-button" type="button" data-i18n="admin-chart-time-filter-container.filter">Filter</button>
    </div>
  </div>
  <!--This div is for administrators only.-->
  <div id="admin-chart-container" style="display:none;">
    <canvas id="admin-chart" style="padding:0em 0.5em 0em"></canvas>
  </div>
  <!--This div is for general-info-table.-->
  <div id="general-info-table-outside-container" style="display:none;">
    <div id="general-info-table-inside-container">
      <table id="general-info-table">
        <tbody>
          <tr data-value="1">
            <th data-i18n="general-info-table.registered_users">Registered Users</th>
            <td></td>
          </tr>
          <tr data-value="2">
            <th data-i18n="general-info-table.number_of_posts">Number of Posts</th>
            <td></td>
          </tr>
          <tr data-value="3">
            <th data-i18n="general-info-table.number_of_active_posts">Number of Active Posts</th>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <!--This div is for posts per poll type charts.-->
  <div id="total-active-posts-outside-container" style="display:none;">
    <div id="total-active-posts-inside-container-buttons">
      <button id="total-posts-button" data-i18n="total-active-posts-outside-container.total-posts-button">Show Total</button>
      <button id="active-posts-button" data-i18n="total-active-posts-outside-container.active-posts-button">Show Active</button>
    </div>
    <div id="total-active-posts-inside-container-charts" style="display:none;">
      <canvas id="total-posts" style="display:none;"></canvas>
      <canvas id="active-posts" style="display:none;"></canvas>
    </div>
  </div>
  <!--This div is for posts per category charts.-->
  <div id="total-active-posts-per-category-outside-container" style="display:none;">
    <div id="total-active-posts-per-category-inside-container-buttons">
      <button id="total-posts-per-category-button" data-i18n="total-active-posts-per-category-outside-container.total-posts-per-category-button">Show Total</button>
      <button id="active-posts-per-category-button" data-i18n="total-active-posts-per-category-outside-container.active-posts-per-category-button">Show Active</button>
    </div>
    <div id="total-active-posts-per-category-inside-container-charts" style="display:none;">
      <canvas id="total-posts-per-category" style="display:none;"></canvas>
      <canvas id="active-posts-per-category" style="display:none;"></canvas>
    </div>
  </div>
  <!--This div is for event map.-->
  <div id="event-map-container" style="display:none;">
    <button id="event-map-container-header" data-i18n="event-map-container.event-map-container-header">Click here to drag</button>
    <div id="post-event-location-map">
      <button class="close-map"><i class="fa-solid fa-xmark"></i></button>
    </div>
  </div>
  <!--This div is for About.-->
  <div id="about-container" style="display:none;">
    <div id="about-inside-container">
      <h1 data-i18n="about-inside-container.about">About</h1>
      <div id="short-app-description">
        <p data-i18n="short-app-description.p1">
          "Check It Yourself" allows registered users to create polls for specific issues/questions and ask other users, located geographically close to the news source,
          to confirm or doubt/challenge its truthfulness. The answers are in the form of preferences/votes which are collected, analyzed, aggregated,
          and visualized so that users are provided with quantitative and qualitative information.
        </p>
        <address style="text-align:center;"><span data-i18n="short-app-description.p2">To contact us you can use the following email:</span><a href="mailto:astefan@ceid.upatras.gr" style="color:#cc0000"> astefan@ceid.upatras.gr</a></address>
        <div id="dropdown-description">
          <div data-i18n="dropdown-description.p1">For a detailed description click</div>
          <button id="dropdown-button" data-i18n="dropdown-description.p2">here</button>
        </div>
      </div>
      <div id="detailed-app-description" style="display:none;">
        <p data-i18n="detailed-app-description.p1">"Check It Yourself": an online crowdsourcing-based application for checking news validity exploiting Social Choice Theory and InfoVis.
          Checking whether news reported via social media or the press is truly valid has recently emerged as a tantalizing issue in our society.
          Despite the existence of various agencies claiming to perform fact checking, there is important skepticism regarding the result credibility which may indeed be
          downgraded or biased due to several factors including financial, political or personal incentives or also incomplete, sloppy processes or lack of appropriate sources.
        </p>
        <p data-i18n="detailed-app-description.p2">
          Motivated by this observation and the fact that the internet and the web can provide an excellent source of crowd intelligence for efficiently collecting/mining data,
          we present "Check It Yourself", an online application which is essentially a crowdsourcing system and decision-making mechanism based on social choice,
          exploiting visualization techniques for allowing users to perform on-the-fly news validity checking.
        </p>
        <p data-i18n="detailed-app-description.p3">
          Social Choice Theory (SCT) - and especially Voting Theory - addresses how to interpret the will of people and bring out a satisfying collective decision based
          on elections in democratic societies, where all citizens have an equal say in the decisions.
          SCT provides a set of methods for the aggregation of a set of individual preferences into a collective preference or decision.
          Such methods include collecting data using different kind of polls, which actually work as ranked, approval (e.g., y/n questions) and
          cardinal (e.g., rating/score questions) voting systems.
        </p>
        <p data-i18n="detailed-app-description.p4">
          "Check It Yourself" allows registered users to create such polls for specific issues/questions and ask other users, located geographically close to the news source,
          to confirm or doubt/challenge its truthfulness. The answers are in the form of preferences/votes which are collected, analyzed, aggregated,
          and visualized so that users are provided with quantitative and qualitative information. Furthermore, live feedback and live updates are automatically provided
          for new polls and newly submitted votes.
        </p>
        <p data-i18n="detailed-app-description.p5">
          For visualization purposes, we deployed Information Visualization (InfoVis) techniques for designing visual representations of abstract data to help users increase
          their knowledge about the internal structure of data and the causal relationships between them. In addition, all generated visualizations together with the corresponding
          data files are fully downloadable so that interested users can save them locally and further process them.
        </p>
        <p data-i18n="detailed-app-description.p6">
          "Check It Yourself" is a lightweight and responsive application with an easy-to-use, friendly graphical interface. It does not require installation nor advanced skills
          to use. It has been developed using mainly javascript (frontend) and php (backend) as well as additional packages, including chart.js and leaflet.js,
          for the visualization of voting results and ipinfo.api for geolocation.
        </p>
        <p data-i18n="detailed-app-description.p7">
          Apart from its broader potential usefulness, "Check It Yourself" can be of particular interest in education since it can contribute to young people (i.e., pupils,
          students) cultivating the mentality of researching instead of believing, increasing their critical thinking and actively develop and practice values of democracy.
        </p>

        <address style="text-align:center;"><span data-i18n="detailed-app-description.p8">To contact us you can use the following email:</span><a href="mailto:astefan@ceid.upatras.gr" style="color:#cc0000;"> astefan@ceid.upatras.gr</a></address>
      </div>
    </div>
  </div>
  <!--This div contains all the posts.-->
  <div id="posts-container">
    <div class="post">
      <div class="post-info">
        <div class="user-who-posted">
          <div style="margin-right: 0.25em;" data-i18n="user-who-posted.posted_by">Posted by</div>
          <div class="post-user-name"></div>
          <div style="display:flex; flex-direction:column-reverse; align-items:center;">
            <div class="post-time"></div>
            <div class="post-time-detailed"></div>
          </div>
          <div data-dir="options" class="post-options-container">
            <i class="fa-solid fa-ellipsis"></i>
            <div class="post-options-inside-container" style="display:none;">
              <div data-dir="download-data" class="post-download-data"><i class="fa-solid fa-arrow-down"></i><span data-i18n="post-options-inside-container.download">Download</span></div>
              <div data-dir="event-location" class="post-event-location"><i class="fa-solid fa-location-dot"></i><span data-i18n="post-options-inside-container.event_location">Event Location</span></div>
            </div>
          </div>
          <div class="poll-timer-container">
            <i class="fa-regular fa-clock"></i>
            <div class="poll-remaining-time"></div>
          </div>
        </div>
        <div class="user-question-answers">
          <div class="post-question"></div>
          <button data-dir="show-results" class="show-results" data-i18n="user-question-answers.show_results">Results</button>
          <div class="total-votes-container">
            <div class="total-votes-text"></div>
          </div>
        </div>
      </div>
      <div class="post-critic">
        <button data-dir="up"><i class="fa-solid fa-chevron-up"></i></button>
        <div class="score"></div>
        <button data-dir="down" style="margin-right:auto;"><i class="fa-solid fa-chevron-down"></i></button>
        <div class="parent_of_check_yes_no_container" style="margin-right:auto;">
          <div class="parent_of_check_yes_no"></div>
          <div class="parent_of_check_yes_no_details"></div>
        </div>
        <button class="parent_of_bookmark" data-dir="bookmark"></button>
      </div>
      <div class="yes-no-results-container" style="display:none;">
        <div class="chartCard">
          <div class="yes-no-total-votes-container">
            <div class="yes-no-total-votes-text"></div>
          </div>
        </div>
        <div class="download-results">
          <button class="download-results-image" data-dir="download-results-img"><i class="fa-solid fa-cloud-arrow-down"></i>PNG</button>
          <button class="download-results-pdf" data-dir="download-results-pdf"><i class="fa-solid fa-cloud-arrow-down"></i>PDF</button>
        </div>
      </div>
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
        <button data-dir="star-vote" class="send-rating-button" data-i18n="rating-vote.send_vote">Send Vote</button>
      </div>
      <div class="rating-vote-results" style="display:none;">
        <div class="rating-vote-results-inside-container">
          <div class="results-poll-name" data-i18n="rating-vote-results-inside-container.rating_results">Rating Results</div>
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
          <div class="rating-total-votes-container">
            <div class="rating-total-votes-text"></div>
          </div>
        </div>
        <div class="download-results">
          <button class="download-results-image" data-dir="download-results-img"><i class="fa-solid fa-cloud-arrow-down"></i>PNG</button>
          <button class="download-results-pdf" data-dir="download-results-pdf"><i class="fa-solid fa-cloud-arrow-down"></i>PDF</button>
        </div>
      </div>
      <div class="approval-vote-container" style="display:none;">
        <div class="approval-choices-container">
          <div data-dir="approval-vote" class="approval-choice" value="1"></div>
          <div data-dir="approval-vote" class="approval-choice" value="2"></div>
          <div data-dir="approval-vote" class="approval-choice" value="3"></div>
        </div>
        <button data-dir="approval-vote-send" class="send-approval-button" data-i18n="approval-vote-container.send_vote">Send Vote</button>
      </div>
      <div class="approval-vote-results" style="display:none;">
        <div class="approval-vote-results-inside-container">
          <div class="results-poll-name" data-i18n="approval-vote-results-inside-container.approval_results">Approval Results</div>
          <div class="approval-chart-card">
            <div class="approval-total-votes-container">
              <div class="approval-total-votes-text"></div>
            </div>
          </div>
        </div>
        <div class="download-results">
          <button class="download-results-image" data-dir="download-results-img"><i class="fa-solid fa-cloud-arrow-down"></i>PNG</button>
          <button class="download-results-pdf" data-dir="download-results-pdf"><i class="fa-solid fa-cloud-arrow-down"></i>PDF</button>
        </div>
      </div>
      <div class="ranking-vote-container" style="display:none;">
        <div class="ranking-choices" data-value="1"></div>
        <button data-dir="ranking-vote-send" class="send-ranking-button" data-i18n="ranking-vote-container.send_vote">Send Vote</button>
      </div>
      <div class="ranking-vote-results" style="display:none;">
        <div class="ranking-vote-results-inside-container">
          <div class="results-poll-name" data-i18n="ranking-vote-results-inside-container.ranking_results">Ranking Results</div>
          <table class="ranking-results-table">
            <tbody></tbody>
          </table>
          <div class="ranking-total-votes-container">
            <div class="ranking-total-votes-text"></div>
          </div>
        </div>
        <div class="download-results">
          <button class="download-results-image" data-dir="download-results-img"><i class="fa-solid fa-cloud-arrow-down"></i>PNG</button>
          <button class="download-results-pdf" data-dir="download-results-pdf"><i class="fa-solid fa-cloud-arrow-down"></i>PDF</button>
        </div>
      </div>
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
</body>

</html>