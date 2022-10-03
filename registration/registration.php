<?php

session_start();

if(isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true){
    header("location: ../index.php");
    exit;
}

require_once "../config.php";

?>
<!doctype html>
<html lang="en">
<head>
    <title>Registration</title>
    <link rel="icon" type="image/x-icon" href="../images/logo.png">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=0.7"/>
    <link rel="stylesheet" type="text/css" href="../style.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.1/jquery.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css"/>
</head>
<body style="overflow:hidden;">
    <div class="top-row">
        <div id="sidenav-icon" onclick="openNav()"><i class="fa-solid fa-bars fa-2x"></i></div>
        <div id="add-post-icon" style="visibility:hidden;"><i class="fa-solid fa-plus fa-4x"></i></div>
        <div id="profile-icon"  onclick="openUserNav()"><i class="fa-solid fa-user fa-4x"></i></div>
    </div>
    <div id="sidenav" class="sidenav">
        <div class="closebtn" onclick="closeNav()"><i class="fa-solid fa-times fa-2x"></i></div>
        <a class="nav-element" href="../index.php"><i class="fa-solid fa-house"></i>Home</a>
    </div>
    <div id="user-nav" class="user-nav">
        <div class="closeuserbtn" onclick="closeUserNav()"><i class="fa-solid fa-times fa-2x"></i></div>
        <a class="nav-element" href="../login/login.php"><i class="fa-solid fa-user"></i>Login</a>
    </div>
    <form id="reg-form" name="registration-form" class="reg">
        <div>
            <i style="margin-left:0.13em;" class="fa-solid fa-circle-user fa-10x"></i>
        </div>
        <div class="input-icons">
            <input type="text" class="form-control" name="username" placeholder="Username">
            <i class="fa-solid fa-user"></i>
        </div>
        <small style="">Min: 6 and max 16 characters</small>
        <span id="user-help"></span>
        <div class="input-icons">
            <input type="email" class="form-control" name="email" placeholder="Email">
            <i class="fa-solid fa-envelope"></i>
        </div>
        <span id="email-help" style=""></span>
        <div class="input-icons">
            <input type="password" class="form-control" name="password" placeholder="Password">
            <i class="fa-solid fa-lock"></i>
        </div>
        <span id="pass-help"></span>
        <span id="pass-help"></span>
        <div class="input-icons">
            <input type="password" class="form-control" name="password_confirm" placeholder="Repeat Password">
            <i class="fa-solid fa-lock"></i>
        </div>
        <span id="passc-help"></span>
        <div>
            <input type="button" class="btn btn-primary" id="sum" value="Submit" onclick="registration_validation()">
        </div>
        <p style="width:13em; font-weight: bold;">Already have an account? <a class="Sign-up" href="../login/login.php">Login now</a></p>
    </form>
    <script src="registration.js"></script>
</body>
</html>
