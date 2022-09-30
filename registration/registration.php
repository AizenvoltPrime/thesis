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
    <meta charset="UTF-8">
    <title>Register</title>
    <link rel="stylesheet" type="text/css" href="../style.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <style type="text/css">
        h2{
            text-align:left;
        }
        .small-space{
            padding:4%;
        }

        h2,p{
            margin-bottom:0;
        }

        .small-margin{
            padding:1%;
        }
    </style>
</head>
<body class="preload" id="logBody">
    <div class="small-space"></div>
    <form id="reg-form" name="registration-form" class="reg">
        <div id="login-red-box-reg" style="opacity:0.9;"></div>
        <ul class="flex-login">
            <li style="opacity:0.9;">
                <h2 style="opacity:0.9;">Register</h2>
                <p style="opacity:0.9;">Please fill the boxes to register.<p>
            </li>
            <li>
                <label class="label-color" style="opacity:0.9;">Username</label>
                <input type="text" class="form-control" name="username" style="opacity:0.9;">
                <div class="small-margin" style="opacity:0.9;"> </div>
                <small class="form-text text-muted">Min: 6 and max 16 characters</small>
                <div class="small-margin" style="opacity:0.9;"> </div>
                <span id="user-help" class="opacityFix" style="opacity:1;"></span>
            </li>
            <li>
                <label class="label-color" style="opacity:0.9;">Email</label>
                <div class="small-margin" style="opacity:0.9;"> </div>
                <input type="email" class="form-control" name="email" style="opacity:0.9;">
                <div class="small-margin" style="opacity:0.9;"> </div>
                <span id="email-help"></span>
            </li>
            <li>
                <label class="label-color" style="opacity:0.9;">Password</label>
                <div class="small-margin" style="opacity:0.9;"> </div>
                <input type="password" class="form-control" name="password" style="opacity:0.9;">
                <div class="small-margin" style="opacity:0.9;"> </div>
                <span id="pass-help"></span>
            </li>
            <li>
                <label class="label-color" style="opacity:0.9;">Repeat Password</label>
                <div class="small-margin" style="opacity:0.9;"> </div>
                <input type="password" class="form-control" name="password_confirm" style="opacity:0.9;">
                <div class="small-margin" style="opacity:0.9;"> </div>
                <span id="passc-help"></span>
            </li>
            <li style="opacity:0.9;">
                <br>
                <input type="button" class="btn btn-primary" id="sum" value="Submit" onclick="registration_validation()">
            </li>
            <p style="text-align:center;" style="opacity:0.9;">Already have an account? <a class="Sign-up" href="../login/login.php">Login now</a>.</p>
        </ul>
    </form>
    <script src="registration.js"></script>
    <div class="ocean">
            <div class="wave"></div>
            <div class="wave"></div>
        </div>
</body>
</html>
