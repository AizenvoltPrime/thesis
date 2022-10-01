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
    <meta name="viewport" content="width=device-width, initial-scale=0.7"/>
    <link rel="stylesheet" type="text/css" href="style.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.1/jquery.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css"/>
  </head>
  <body>
    <div id="sidenav-icon" class="clickableAwesomeFont" onclick="openNav()" style="float:left;"><i class="fa-solid fa-bars fa-2x"></i></div>
    <div id="add-post-icon"><i class="fa-solid fa-plus fa-4x"></i></div>
    <div id="sidenav" class="sidenav">
      <div class="closebtn" onclick="closeNav()"><i class="fa-solid fa-times fa-2x"></i></div>
      <a class="nav-element" href="index.php"><i class="fa-solid fa-house"></i>Home</a>
      <a class="nav-element" href="logout.php"><i class="fa-solid fa-arrow-right-from-bracket"></i>Logout</a>
    </div>
    <script src="index.js"></script>
  </body>
</html>
