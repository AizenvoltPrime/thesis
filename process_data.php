<?php

session_start();

$jsonString = file_get_contents('php://input');
$data = json_decode($jsonString, true);

if($data['request'] == "user_status")
{
    if(!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true){
        echo "false";
    }
}
else if($data['request'] == "upload_post_data")
{
    require_once "config.php";
    $post_text=$data['question'];
    $poll_type=$data['poll_choice'];

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


    $sql = "INSERT INTO posts (user_id, poll_type, post_category, post_text, post_date) VALUES (?, ?, ?, ?, ?)";
    if ($stmt = mysqli_prepare($conn, $sql)){
    // Bind variables to the prepared statement as parameters
    mysqli_stmt_bind_param($stmt, "iiiss", $param_userID, $param_poll_type, $param_post_category, $param_text, $param_date);
    $param_userID = $_SESSION["id"];
    $param_post_category = 1;
    $param_text = $post_text;
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
else if($data['request'] == "get_post_data")
{
    require_once "config.php";
    $post_data=array();

    $sql = "SELECT post_number,user.username AS username,polls.poll_name AS poll_name,categories.category_name AS category_name,post_text,SUM(chevron_vote.chevron_up) 
    AS chevron_up, SUM(chevron_vote.chevron_down) AS chevron_down,post_date FROM posts INNER JOIN user ON posts.user_id=user.id INNER JOIN polls 
    ON posts.poll_type=polls.poll_id INNER JOIN categories ON posts.post_category=categories.category_id INNER JOIN chevron_vote ON posts.post_number=chevron_vote.post_id 
    GROUP BY user.username,post_number ORDER BY post_date DESC";

    $result = mysqli_query($conn, $sql);
    if($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $tmp = array($row["post_number"],$row["username"], $row["poll_name"],$row["category_name"],$row["post_text"],$row["chevron_up"],$row["chevron_down"],$row["post_date"]);
            array_push($post_data,$tmp);
        }
    }
    echo json_encode($post_data);
}

?>