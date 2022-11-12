<?php

session_start();

require_once "../old_config.php";

if ($_SERVER['REQUEST_METHOD'] == 'POST') {

    $username = post_data('username');
    $email = post_data('email');
    $password = trim($_POST["password"]);
    $insertionCheck = true;
    $sql = "SELECT * FROM user WHERE username = '$username'";
    $result = mysqli_query($conn, $sql);
    if (mysqli_num_rows($result) > 0) {
        echo "This username is already taken.";
        $insertionCheck = false;
    }

    if ($insertionCheck) {
        $sql = "SELECT * FROM user WHERE email = '$email'";
        $result = mysqli_query($conn, $sql);
        if (mysqli_num_rows($result) > 0) {
            echo "This email is already being used.";
            $insertionCheck = false;
        } else if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo "Please enter a valid email address";
            $insertionCheck = false;
        }
    }

    if ($insertionCheck) {
        $sql = "INSERT INTO user (username, email, password) VALUES (?, ?, ?)";

        if ($stmt = mysqli_prepare($conn, $sql)) {
            // Bind variables to the prepared statement as parameters
            mysqli_stmt_bind_param($stmt, "sss", $param_username, $param_email, $param_password);
            $param_username = $username;
            $param_email = $email;
            $param_password = password_hash($password, PASSWORD_DEFAULT);
            // Attempt to execute the prepared statement
            if (mysqli_stmt_execute($stmt)) {
                // Redirect to login page
                echo "Success";
            } else {
                echo "Something went wrong! Please try again later!";
            }
            // Close statement
            mysqli_stmt_close($stmt);
        }
    }
}

function post_data($field)
{
    if (!isset($_POST[$field])) {
        return false;
    }
    $data = $_POST[$field];
    return htmlspecialchars(stripslashes(trim($data)));
}
