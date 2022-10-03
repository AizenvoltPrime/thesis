<?php

session_start();

if($_POST['request'] == "user_status")
{
    if(!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true){
        echo "false";
    }
}

else if($_POST['request'] == "upload_post_data")
{
    require_once "config.php";
    $post_text=$_POST['question'];
    $poll_type=$_POST['poll_choice'];

    if($poll_type=="yes-no")
    {
        $param_poll_type = 1;
    }
    elseif($poll_type=="rating")
    {
        $param_poll_type = 2;
    }
    elseif($poll_type=="approval")
    {
        $param_poll_type = 3;
    }
    elseif($poll_type=="ranking")
    {
        $param_poll_type = 4;
    }


    $sql = "INSERT INTO posts (user_id, poll_type, post_category, text, upvote, downvote, post_date) VALUES (?, ?, ?, ?, ?, ?, ?)";
    if ($stmt = mysqli_prepare($conn, $sql)){
    // Bind variables to the prepared statement as parameters
    mysqli_stmt_bind_param($stmt, "iiisiis", $param_userID, $param_poll_type, $param_post_category, $param_text, $param_upvote, $param_downvote, $param_date);
    $param_userID = $_SESSION["id"];
    $param_post_category = 1;
    $param_text = $post_text;
    $param_upvote = 0;
    $param_downvote = 0;
    date_default_timezone_set('Europe/Athens');
    $param_date = date('Y/m/d H:i:s a', time());
    // Attempt to execute the prepared statement
    if (mysqli_stmt_execute($stmt)){
        echo "Success!";
    } else {
        echo "Something went wrong. Please try again later.";
    }
    // Close statement
    mysqli_stmt_close($stmt);
}
}

?>