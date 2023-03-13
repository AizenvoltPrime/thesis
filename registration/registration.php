<?php

session_start();

if (isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true) {
    header("location: ../index.php");
    exit;
}

require_once "../old_config.php";

?>
<!doctype html>
<html lang="en">

<head>
    <title>Registration</title>
    <link rel="icon" type="image/x-icon" href="../images/logo.png">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=0.7" />
    <link rel="stylesheet" type="text/css" href="../style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css" />
    <script src="https://unpkg.com/@andreasremdt/simple-translator@latest/dist/umd/translator.min.js"></script>
    <script type="module" src="registration.js"></script>
    <script type="module" src="registration_translate.js"></script>
</head>

<body style="overflow:hidden;">
    <div class="top-row">
        <div id="sidenav-icon"><i class="fa-solid fa-bars fa-2x"></i></div>
        <div id="add-post-icon" style="visibility:hidden;"><i class="fa-solid fa-plus fa-4x"></i></div>
        <div id="profile-icon"><i class="fa-solid fa-user fa-4x" style="color:#979797"></i></div>
    </div>
    <div id="sidenav" class="sidenav">
        <div class="closebtn"><i class="fa-solid fa-times fa-2x"></i></div>
        <a class="nav-element" href="../index.php"><i class="fa-solid fa-house"></i><span data-i18n="sidenav.home">Home</span></a>
    </div>
    <div id="user-nav" class="user-nav">
        <div class="closeuserbtn"><i class="fa-solid fa-times fa-2x"></i></div>
        <a class="nav-element" href="../login/login.php"><i class="fa-solid fa-user" style="background: -webkit-linear-gradient(200deg, #cc0000, #000); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;"></i><span data-i18n="usernav.login">Login</span></a>
        <a class="nav-element"><i class="fa-solid fa-globe fa-1x"></i><span data-i18n="usernav.language">Language</span></a>
        <div id="language" style="display:none;">
            <div id="en">English</div>
            <div id="el">Ελληνικά</div>
        </div>
    </div>
    <form id="reg-form" name="registration-form" class="reg">
        <div>
            <i class="fa-solid fa-circle-user fa-10x"></i>
        </div>
        <div class="input-icons">
            <input type="text" class="form-control" name="username" placeholder="Username">
            <i class="fa-solid fa-user fa-2x" style="background: -webkit-linear-gradient(200deg, #cc0000, #000); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;"></i>
        </div>
        <small style="font-size:1.2em; color:#f3f3f3;"><span data-i18n="reg-form.text1">Min 6 and max 16 characters</span></small>
        <span id="user-help"></span>
        <div class="input-icons">
            <input type="email" class="form-control" name="email" placeholder="Email">
            <i class="fa-solid fa-envelope fa-2x"></i>
        </div>
        <span id="email-help"></span>
        <div class="input-icons">
            <input type="password" class="form-control" name="password" placeholder="Password">
            <i class="fa-solid fa-lock fa-2x"></i>
        </div>
        <span id="pass-help"></span>
        <span id="pass-help"></span>
        <div class="input-icons">
            <input type="password" class="form-control" name="password_confirm" placeholder="Repeat Password">
            <i class="fa-solid fa-lock fa-2x"></i>
        </div>
        <span id="passc-help"></span>
        <div>
            <input type="button" class="btn btn-primary" id="sum" value="Submit">
        </div>
        <p style="font-weight: bold; font-size:1.2em; color:#f3f3f3;"><span data-i18n="reg-form.text2">Already have an account? </span><a class="Sign-up" href="../login/login.php"><span data-i18n="reg-form.text3">Login now</span></a></p>
    </form>
</body>

</html>