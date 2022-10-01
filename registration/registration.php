<?php

session_start();

if(isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true){
    header("location: ../welcome.php");
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
    <form id="reg-form" name="registration-form" class="reg">
        <div class="flex-login">
            <div>
                <i style="margin-left:0.13em;" class="fa-solid fa-circle-user fa-10x"></i>
            </div>
            <div class="input-icons">
                <input type="text" class="form-control" name="username" placeholder="Username">
                <i class="fa-solid fa-user"></i>
            </div>
            <small style="width:20em;">Min: 6 and max 16 characters</small>
            <span id="user-help"></span>
            <div class="input-icons">
                <input type="email" class="form-control" name="email" placeholder="Email">
                <i class="fa-solid fa-envelope"></i>
            </div>
            <span id="email-help"></span>
            <div class="input-icons">
                <input type="password" class="form-control" name="password" placeholder="Password">
                <i class="fa-solid fa-lock"></i>
            </div>
            <span style="width:20em;" id="pass-help"></span>
            <div class="input-icons">
                <input type="password" class="form-control" name="password_confirm" placeholder="Repeat Password">
                <i class="fa-solid fa-lock"></i>
            </div>
            <span id="passc-help"></span>
            <div>
                <input type="button" class="btn btn-primary" id="sum" value="Submit" onclick="registration_validation()">
            </div>
            <p style="width:13em; font-weight: bold;">Already have an account? <a class="Sign-up" href="../login/login.php">Login now</a></p>
        </div>
    </form>
    <script src="registration.js"></script>
</body>
</html>
