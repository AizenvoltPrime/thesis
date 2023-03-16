<?php
// Initialize the session
session_start();

// Check if the user is already logged in, if yes then redirect him to welcome page
if (isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true) {
    header("location: ../index.php");
    exit;
}

// Include config file
require_once "../old_config.php";

?>

<!DOCTYPE html>
<html lang="en">

<head>
    <title>Login</title>
    <link rel="icon" type="image/x-icon" href="../images/logo.png">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=0.7" />
    <link rel="stylesheet" type="text/css" href="../style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css" />
    <script src="https://unpkg.com/@andreasremdt/simple-translator@latest/dist/umd/translator.min.js"></script>
    <script type="module" src="login.js"></script>
    <script type="module" src="login_translate.js"></script>
</head>

<body style="overflow:hidden;">
    <div class="top-row">
        <div id="sidenav-icon"><i class="fa-solid fa-bars fa-2x"></i></div>
        <div id="add-post-icon" style="visibility:hidden;"><i class="fa-solid fa-plus fa-4x"></i></div>
        <div id="profile-icon"><i class="fa-solid fa-user fa-4x" style="color:#979797"></i></div>
    </div>
    <div id="sidenav" class="sidenav">
        <div class="closebtn"><i class="fa-solid fa-times"></i></div>
        <a class="nav-element" href="../index.php"><i class="fa-solid fa-house"></i><span data-i18n="sidenav.home">Home</span></a>
    </div>
    <div id="user-nav" class="user-nav">
        <div class="closeuserbtn"><i class="fa-solid fa-times"></i></div>
        <a class="nav-element" href="../registration/registration.php"><i class="fa-solid fa-user" style="color:#850000"></i><span data-i18n="usernav.registration">Registration</span></a>
        <a class="nav-element"><i class="fa-solid fa-globe fa-1x"></i><span data-i18n="usernav.language">Language</span></a>
        <div id="language" style="display:none;">
            <div id="en">English</div>
            <div id="el">Ελληνικά</div>
        </div>
    </div>
    <form id="login-form" name="login-form">
        <div>
            <i class="fa-solid fa-circle-user fa-10x"></i>
        </div>
        <div class="input-icons">
            <input type="text" name="username" class="form-control" placeholder="Username">
            <i class="fa-solid fa-user fa-2x" style="color:#850000"></i>
        </div>
        <span id="user-help"></span>
        <div class="input-icons">
            <input type="password" name="password" class="form-control" placeholder="Password">
            <i class="fa-solid fa-lock fa-2x"></i>
        </div>
        <span id="pass-help"></span>
        <div>
            <input id="sum" type="button" value="Login">
        </div>
        <div>
            <p style="font-size:1.2em; color:#f3f3f3;"><span data-i18n="login-form.text1">Don't have an account? </span><a class="Sign-up" href="../registration/registration.php"><span data-i18n="login-form.text2">Sign up now</span></a></p>
        </div>
    </form>
</body>

</html>