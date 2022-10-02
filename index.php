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
  </head>
  <body>
    <div class="top-row">
      <div id="sidenav-icon" onclick="openNav()"><i class="fa-solid fa-bars fa-2x"></i></div>
      <div id="add-post-icon" onclick="createPoll()"><i class="fa-solid fa-plus fa-4x"></i></div>
      <div id="profile-icon"  onclick="openUserNav()"><i class="fa-solid fa-user fa-4x"></i></div>
    </div>
    <div id="sidenav" class="sidenav">
      <div class="closebtn" onclick="closeNav()"><i class="fa-solid fa-times fa-2x"></i></div>
      <a class="nav-element" href="index.php"><i class="fa-solid fa-house"></i>Home</a>
    </div>
    <div id="user-nav" class="user-nav">
      <div class="closeuserbtn" onclick="closeUserNav()"><i class="fa-solid fa-times fa-2x"></i></div>
      <a class="nav-element" href="login/login.php"><i class="fa-solid fa-user"></i>Login</a>
      <a class="nav-element" href="registration/registration.php"><i class="fa-solid fa-user"></i>Registration</a>
      <a class="nav-element" href="logout.php"><i class="fa-solid fa-arrow-right-from-bracket"></i>Logout</a>
    </div>
    <div id="all-filters">
      <div id="hot" onclick="hot()"><i class="fa-solid fa-fire-flame-curved"></i>Hot</div>
      <div id="recent" onclick="recent()"><i class="fa-solid fa-sun"></i>Recent</div>
      <div id="preffered-categories" onclick="preffered_categories()"><i class="fa-solid fa-table-list"></i>Preffered Categories</div>
      <div id="filter" onclick="filter()"><i class="fa-solid fa-filter"></i>Filter</div>
      <div id="search" onclick="search()"><i class="fa-solid fa-magnifying-glass"></i>Search</div>
    </div>
    <div id="poll-selection">
      <div id="first-quetion">Choose one of the following poll types.</div>
      <div id="yes-no" onclick="yes_no()">Yes/No</div>
      <div id="rating" onclick="rating()">Rating</div>
      <div id="approval" onclick="approval()">Approval</div>
      <div id="ranking" onclick="ranking()">Ranking</div>
    </div>
    <form id="poll-question">
        <div id="question-instruction">Type your question.</div>
        <textarea id="question" type="text" name="question-text"></textarea>
        <input id= "sum" type="button" value="Post Poll" onclick="postPoll()" style="width:8em; height:3em; font-size: 1.3em;">
    </form>
    <script src="index.js"></script>
  </body>
</html>