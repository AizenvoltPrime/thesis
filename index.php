<?php
// Initialize the session
session_start();
// Include config file
require_once "config.php";
?>

<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Crowdsource</title>
    <link rel="icon" type="image/x-icon" href="images/logo.png">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <link rel="stylesheet" type="text/css" href="style.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.1/jquery.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css"/>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.4/moment.min.js"></script>
    
  </head>
  <body>
    <div class="top-row">
      <button id="sidenav-icon"><i class="fa-solid fa-bars fa-2x"></i></button>
      <button id="add-post-icon"><i class="fa-solid fa-plus fa-4x"></i></button>
      <button id="profile-icon"><i class="fa-solid fa-user fa-4x"></i></button>
    </div>
    <div id="sidenav" class="sidenav">
      <button class="closebtn"><i class="fa-solid fa-times fa-2x"></i></button>
      <a class="nav-element" href="index.php"><i class="fa-solid fa-house"></i>Home</a>
    </div>
    <div id="user-nav" class="user-nav">
      <button class="closeuserbtn"><i class="fa-solid fa-times fa-2x"></i></button>
      <a class="nav-element" href="login/login.php"><i class="fa-solid fa-user"></i>Login</a>
      <a class="nav-element" href="registration/registration.php"><i class="fa-solid fa-user"></i>Registration</a>
      <a class="nav-element" href="logout.php"><i class="fa-solid fa-arrow-right-from-bracket"></i>Logout</a>
    </div>
    <div id="all-filters">
      <button id="hot"><i class="fa-solid fa-fire-flame-curved"></i>Hot</button>
      <button id="recent"><i class="fa-solid fa-sun"></i>Recent</button>
      <button id="preferred-categories"><i class="fa-solid fa-table-list"></i>Preferred Categories</button>
      <button id="filter"><i class="fa-solid fa-filter"></i>Filter</button>
      <button id="search"><i class="fa-solid fa-magnifying-glass"></i>Search</button>
    </div>
    <div id="poll-selection">
      <div id="first-quetion">Choose one of the following poll types.</div>
      <button id="yes-no">Yes/No</button>
      <button id="rating">Rating</button>
      <button id="approval">Approval</button>
      <button id="ranking">Ranking</button>
    </div>
    <div id="warning-nothing-selected">You must choose a poll type!</div>
    <form id="poll-question">
        <div id="question-instruction">Type your question.</div>
        <textarea id="question" type="text" name="question-text"></textarea>
        <button id= "sum" type="button" style="width:8em; height:3em; font-size: 1.3em;">Post Poll</button>
    </form>
    <div id="warning-empty-text-area">Textarea needs to have at least 15 characters!</div>
    <div id="posts-container">
      <div id="post">
        <div id="post-info">
          <div id="user-who-posted">
            <div style="margin-right: 0.25em;">Posted by</div>
            <div id="post-user-name"></div>
            <div style="display:flex; flex-direction:column-reverse; align-items:center;">
              <div id="post-time"></div>
              <div id="post-time-detailed"></div>
            </div>
            <div><i class="fa-regular fa-bookmark"></i></div>
          </div>
          <div id="user-question-answers">
            <div class="post-question"></div>
            <button class="answer">Yes</button>
            <button class="answer" style="margin-right:0.5em;">No</button>
            <div id="show-graph">Show Graph</div>
          </div>
        </div>
        <div id="post-critic">
          <div id="critic-icons">
            <button data-dir="up"><i class="fa-solid fa-chevron-up"></i></button>
            <button data-dir="down"><i class="fa-solid fa-chevron-down"></i></button>
          </div>
          <div id="critic-score">
            <div class="score"></div>
            <div class="score"></div>
          </div>
        </div>
      </div>
    </div>
    <script src="index.js"></script>
  </body>
</html>