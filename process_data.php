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


    $sql = "INSERT INTO posts (user_id, poll_type, post_category, post_text, chevron_up, chevron_down, post_date) VALUES (?, ?, ?, ?, ?, ?, ?)";
    if ($stmt = mysqli_prepare($conn, $sql)){
    // Bind variables to the prepared statement as parameters
    mysqli_stmt_bind_param($stmt, "iiisiis", $param_userID, $param_poll_type, $param_post_category, $param_text, $param_upvote, $param_downvote, $param_date);
    $param_userID = $_SESSION["id"];
    $param_post_category = 1;
    $param_text = $post_text;
    $param_upvote = 0;
    $param_downvote = 0;
    date_default_timezone_set('Europe/Athens');
    $param_date = date('Y/m/d H:i:s', time());
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
else if($_POST['request'] == "get_post_data")
{
    require_once "config.php";
    $post_data=array();
    $post="Fuck";

    $sql = "SELECT COUNT(*) as number_of_users FROM user WHERE role='user'";

    $sql = "SELECT user.username AS username,polls.poll_name AS poll_name,categories.category_name AS category_name,post_text,chevron_up,chevron_down,post_date 
    FROM posts INNER JOIN user ON posts.user_id=user.id INNER JOIN polls ON posts.poll_type=polls.poll_id INNER JOIN categories 
    ON posts.post_category=categories.category_id;";

    $result = mysqli_query($conn, $sql);
    if($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $tmp = array($row["username"], $row["poll_name"],$row["category_name"],$row["post_text"],$row["chevron_up"],$row["chevron_down"],$row["post_date"]);
            array_push($post_data,$tmp);
        }
    }
    echo json_encode($post_data);
}

?>