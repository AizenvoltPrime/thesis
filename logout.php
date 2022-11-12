<?php
// Initialize the session
session_start();

require_once "new_config.php";

$stmt = $conn->prepare("UPDATE user SET connected_devices=connected_devices-1 WHERE id=:id");
$stmt->execute([":id" => $_SESSION["id"]]);

$stmt = $conn->prepare("UPDATE user SET status=IF(connected_devices<1,'offline','online') WHERE id=:id");
$stmt->execute([":id" => $_SESSION["id"]]);

// Unset all of the session variables
$_SESSION = array();

// Destroy the session.
session_destroy();

// Redirect to login page
header("location: ./login/login.php");
exit;
