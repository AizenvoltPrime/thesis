<?php
// Initialize the session
session_start();

// Check if the user is already logged in, if yes then redirect him to welcome page
if(isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true){
    header("location: ../welcome.php");
    exit;
}

// Include config file
require_once "../config.php";

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <title>Login</title>
    <link rel="icon" type="image/x-icon" href="../images/logo.png">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=0.7"/>
    <link rel="stylesheet" type="text/css" href="../style.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.1/jquery.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css"/>
</head>
<body style="overflow:hidden;">
        <div id="sidenav-icon" class="clickableAwesomeFont" onclick="openNav()"><i class="fa-solid fa-bars fa-2x"></i></div>
        <div id="sidenav" class="sidenav">
            <div class="closebtn" onclick="closeNav()"><i class="fa-solid fa-times fa-2x"></i></div>
            <a class="nav-element" href="../index.php"><i class="fa-solid fa-house"></i>Home</a>
        </div>
        <form id="login-form" name="login-form">
            <div class="flex-login">
                <div>
                    <i style="margin-left:0.13em;" class="fa-solid fa-circle-user fa-10x"></i>
                </div>
                <div class="input-icons">
                    <input type="text" name="username" class="form-control" placeholder="Username">
                    <i class="fa-solid fa-user"></i>
                </div>
                <span id="user-help"></span>
                <div class="input-icons">
                    <input type="password" name="password" class="form-control" placeholder="Password">
                    <i class="fa-solid fa-lock"></i>
                </div>
                <span id="pass-help"></span>
                <div>
                    <input id= "sum" type="button" value="Login" onclick="login_validation()">
                </div>
                <div>
                    <p style="width:12em; font-weight: bold;">Don't have an account? <a class="Sign-up" href="../registration/registration.php">Sign up now</a></p>
                </div>
            </div>
        </form>
        <script src="login.js"></script>
</body>
</html>