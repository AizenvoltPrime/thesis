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
    <meta charset="UTF-8">
    <title>Login</title>
    <link rel="stylesheet" type="text/css" href="../style.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <style type="text/css">
        h2{
            text-align:left;
        }
        .small-space{
            padding:4%;
        }

        h2{
            margin-bottom:0;
        }

        .small-margin{
            padding:1%;
        }
    </style>
</head>
<body class="preload" id="logBody">
        <div class="small-space"></div>
        <form id="login-form" name="login-form">
            <div id="login-red-box-sign" style="opacity:0.9;"></div>
        <ul class="flex-login">
            <li style="opacity:0.9;">
                <h2>Login</h2>
                <p>Please fill in your credentials to login.</p>
            </li>
            <li>
                <label class="label-color" style="opacity:0.9;">Username</label>
                <input type="text" name="username" class="form-control" style="opacity:0.9;">
                <div class="small-margin" style="opacity:0.9;"> </div>
                <span id="user-help"></span>
            </li>
            <br style="opacity:0.9;">
            <li> 
                <label class="label-color" style="opacity:0.9;">Password</label>
                <input type="password" name="password" class="form-control" style="opacity:0.9;">
                <div class="small-margin" style="opacity:0.9;"> </div>
                <span id="pass-help" style="opacity:1;"></span>
            </li>
            <li style="opacity:0.9;">
                <br>
                <input id= "sum" type="button" value="Login" onclick="login_validation()">
            <li>
            <p>Don't have an account? <a class="Sign-up" href="../registration/registration.php">Sign up now</a>.</p>
        </ul>
        </form>
        <script src="login.js"></script>
        <div class="ocean">
            <div class="wave"></div>
            <div class="wave"></div>
        </div>
</body>
</html>