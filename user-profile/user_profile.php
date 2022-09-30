<?php
// Initialize the session
session_start();

// Check if the user is logged in, if not then redirect to login page
if(!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true){
    header("location: ../login/login.php");
    exit;
}

// Include config file
require_once "../config.php";
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>User Profile</title>
    <link rel="stylesheet" type="text/css" href="../style.css">
    <link rel="stylesheet" type="text/css" href="./user_profile.css">
    <link rel="stylesheet" type="text/css" href="../user.css">
    <link rel = "stylesheet" href = "http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.css"/>
    <script src = "http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/heatmapjs@2.0.2/heatmap.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/leaflet-heatmap@1.0.0/leaflet-heatmap.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
</head>
<style>

p{
    font-weight: normal;
}

.form-group{
    padding:1%;
}

.menu-space{
    padding:10%;
}

</style>
<body>
    <div id="content">
        <img class="resize" src="../images/logo-header.png" alt="Logo"/>
            <br style="clear:both">
            <div class="topnav">
                <a href="http://localhost/project/welcome.php">Home</a>
                <a class="active" href="http://localhost/project/user-profile/user_profile.php">User Profile</a>
                <a id= "admin-only" href="http://localhost/project/users-info/users_info.php">Users Info</a>
                <a href="http://localhost/project/logout.php">Logout</a>
            </div>
        <hr class="solid"/>
            <div class="side_nav">
                <button class="nav_btn" id="ru" onclick="showResetUsername()">Reset Username</button>
                <button class="nav_btn" id="rp" onclick="showResetPassword()">Reset Password</button>
                <button class="nav_btn" id="ss" onclick="showStatistics()">Show Statistics</button>
                <button class="nav_btn" id="sm" onclick="showMap()">Your HTTP Request Locations</button>
            </div>
        <div class="flex-container">
            <div id = "map" style = "width: 850px; height: 470px"></div>
            <div id="ResetUsername">
            <h2>Reset Username</h2>
            <p>Please fill out this form to reset your username.</p>
                <form name="u-form" id="new-username" action="<?php echo 'reset_username.php'; ?>" method="post">
                    <div class="form-group">
                        <h4 class="insideOut">Username</h4>
                        <input class="form-control" name="new_username">
                        <br>
                        <small><b>Min: 6 and max 16 characters<b></small>
                        <div>
                        <span id="username-help-block"></span>
                        </div>
                    </div>
                    <div class="form-group">
                        <input type="button" class="btn btn-primary"  id="sum_us" value="Submit" onclick="username_check()">
                        <a class="btn btn-link" href="user_profile.php">Cancel</a>
                    </div>
                </form>
            </div>
        <div id="ResetPassword">
            <h2>Reset Password</h2>
            <p>Please fill out this form to reset your password.</p>
            <form name= "pass-form" id="new-password" action ="<?php echo  htmlspecialchars('reset_password.php');?>" method="post"> 
                <div class="form-group">
                    <h4 class="insideOut">New Password</h4>
                    <input type="password" class="form-control" name="new_password">
                </div>
                <span id="password-help-block"></span>
                <div class="form-group">
                    <h4 class="insideOut">Confirm Password</h4>
                    <input type="password" class="form-control" name="confirm_password">
                </div>
                <div class="form-group">
                        <input type="button" class="btn btn-primary" id="sum_pass"  value="Submit" onclick="password_check()">
                        <a class="btn btn-link" href="user_profile.php">Cancel</a>
                </div>
            </form>    
        </div>
        <div id="ShowStatistics">
            <table id="content-table">
            <thead>
            <tr> 
                <th>Last Upload Date</th>
                <th>Number of Entries</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                <td id="last_upload"></td>
                <td id="total_entries"></td>
                </tr>
            </tbody>
            </table>
        </div>
        </div>
    </div>
    <div id="loader">Loading...</div>
    <script src="user_profile.js"></script>
</body>
</html>    


