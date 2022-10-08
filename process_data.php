<?php

session_start();

$jsonString = file_get_contents('php://input');
$data = json_decode($jsonString, true);

if($data['request'] == "request_username")
{
    echo $_SESSION["username"];
}
else if($data['request'] == "user_status")
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

    if(isset($_SESSION['id']))
    {
        $sql = "SELECT posts.post_number AS post_number, user.username AS username, polls.poll_name AS poll_name, categories.category_name AS category_name,
            posts.post_text AS post_text, sum(chevron_vote.chevron_result) AS chevron_result, posts.post_date AS post_date, 
            COALESCE((SELECT chevron_vote.chevron_result FROM chevron_vote WHERE chevron_vote.user_id='$_SESSION[id]' and chevron_vote.post_id=post_number),0) AS user_chevron_result,
            COALESCE((SELECT yes_no.answer_yes FROM yes_no WHERE yes_no.user_id='$_SESSION[id]' and yes_no.post_id=post_number),0) AS user_yes_answer,
            COALESCE((SELECT yes_no.answer_no FROM yes_no WHERE yes_no.user_id='$_SESSION[id]' and yes_no.post_id=post_number),0) AS user_no_answer,
            COALESCE((SELECT bookmarks.user_bookmark FROM bookmarks WHERE bookmarks.user_id='$_SESSION[id]' and bookmarks.post_id=post_number),0) AS user_bookmark
            FROM posts join user on posts.user_id = user.id join polls on posts.poll_type = polls.poll_id join categories 
            on posts.post_category = categories.category_id join chevron_vote ON posts.post_number = chevron_vote.post_id 
            GROUP BY posts.post_number ORDER BY posts.post_date DESC";

        $result = mysqli_query($conn, $sql);
        if($result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                $tmp = array($row["post_number"],$row["username"], $row["poll_name"],$row["category_name"],$row["post_text"],
                $row["chevron_result"],$row["post_date"],$row["user_chevron_result"],$row["user_yes_answer"],$row["user_no_answer"],$row["user_bookmark"]);
                array_push($post_data,$tmp);
            }
        }
        echo json_encode($post_data);
    }
    else {
        $sql = "SELECT post_number,username,poll_name,category_name,post_text,chevron_result,post_date FROM posts_info";

        $result = mysqli_query($conn, $sql);
        if($result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                $tmp = array($row["post_number"],$row["username"], $row["poll_name"],$row["category_name"],$row["post_text"],$row["chevron_result"],$row["post_date"]);
                array_push($post_data,$tmp);
            }
        }
        echo json_encode($post_data);
    }
}
else if($data['request'] == "chevron_vote")
{
    require_once "config.php";

    if($data['direction'] == "up" && $data['previous_vote'] == "up")
    {
        $sql = "UPDATE chevron_vote SET chevron_result = 0 WHERE post_id='$data[post_id]' AND user_id='$_SESSION[id]'";       
        mysqli_query($conn, $sql);
        echo "Success";
    }
    else if ($data['direction'] == "up" && $data['previous_vote'] == "down") {
        $sql = "UPDATE chevron_vote SET chevron_result = 1 WHERE post_id='$data[post_id]' AND user_id='$_SESSION[id]'";       
        mysqli_query($conn, $sql);
        echo "Success";
    }
    else if($data['direction'] == "up" && $data['previous_vote'] == "no")
    {
        $sql = "SELECT post_id,user_id FROM chevron_vote WHERE post_id='$data[post_id]' AND user_id='$_SESSION[id]'"; 
        $result = mysqli_query($conn, $sql);
        if($result->num_rows > 0)
        {
            $sql = "UPDATE chevron_vote SET chevron_result = 1 WHERE post_id='$data[post_id]' AND user_id='$_SESSION[id]'";       
            mysqli_query($conn, $sql);
            echo "Success";
        }
        else if($result->num_rows == 0)
        {
            $sql = "INSERT INTO chevron_vote(post_id,user_id,chevron_result) VALUES ('$data[post_id]','$_SESSION[id]',1)";       
            mysqli_query($conn, $sql);
            echo "Success";
        }
    }
    else if($data['direction'] == "down" && $data['previous_vote'] == "down")
    {
        $sql = "UPDATE chevron_vote SET chevron_result = 0 WHERE post_id='$data[post_id]' AND user_id='$_SESSION[id]'";       
        mysqli_query($conn, $sql);
        echo "Success";
    }
    else if($data['direction'] == "down" && $data['previous_vote'] == "up")
    {
        $sql = "UPDATE chevron_vote SET chevron_result = -1 WHERE post_id='$data[post_id]' AND user_id='$_SESSION[id]'";       
        mysqli_query($conn, $sql);
        echo "Success";
    }
    else if($data['direction'] == "down" && $data['previous_vote'] == "no")
    {
        $sql = "SELECT post_id,user_id FROM chevron_vote WHERE post_id='$data[post_id]' AND user_id='$_SESSION[id]'"; 
        $result = mysqli_query($conn, $sql);
        if($result->num_rows > 0)
        {
            $sql = "UPDATE chevron_vote SET chevron_result = -1 WHERE post_id='$data[post_id]' AND user_id='$_SESSION[id]'";       
            mysqli_query($conn, $sql);
            echo "Success";
        }
        else if($result->num_rows == 0)
        {
            $sql = "INSERT INTO chevron_vote(post_id,user_id,chevron_result) VALUES ('$data[post_id]','$_SESSION[id]',-1)";       
            mysqli_query($conn, $sql);
            echo "Success";
        }
    }
}
else if($data['request'] == "yes_no_vote")
{
    require_once "config.php";

    if($data['current_vote'] == "yes" && $data['previous_vote'] == "yes")
    {
        $sql = "UPDATE yes_no SET answer_yes = 0 WHERE post_id='$data[post_id]' AND user_id='$_SESSION[id]'";       
        mysqli_query($conn, $sql);
        echo "Success";
    }
    else if ($data['current_vote'] == "yes" && $data['previous_vote'] == "no") {
        $sql = "UPDATE yes_no SET answer_yes = 1, answer_no=0 WHERE post_id='$data[post_id]' AND user_id='$_SESSION[id]'";       
        mysqli_query($conn, $sql);
        echo "Success";
    }
    else if($data['current_vote'] == "yes" && $data['previous_vote'] == "nothing")
    {
        $sql = "SELECT post_id,user_id FROM yes_no WHERE post_id='$data[post_id]' AND user_id='$_SESSION[id]'"; 
        $result = mysqli_query($conn, $sql);
        if($result->num_rows > 0)
        {
            $sql = "UPDATE yes_no SET answer_yes = 1 WHERE post_id='$data[post_id]' AND user_id='$_SESSION[id]'";       
            mysqli_query($conn, $sql);
            echo "Success";
        }
        else if($result->num_rows == 0)
        {
            $sql = "INSERT INTO yes_no(post_id,user_id,post_category,answer_yes,answer_no) VALUES ('$data[post_id]','$_SESSION[id]',1,1,0)";       
            mysqli_query($conn, $sql);
            echo "Success";
        }
    }
    else if($data['current_vote'] == "no" && $data['previous_vote'] == "no")
    {
        $sql = "UPDATE yes_no SET answer_no = 0 WHERE post_id='$data[post_id]' AND user_id='$_SESSION[id]'";       
        mysqli_query($conn, $sql);
        echo "Success";
    }
    else if ($data['current_vote'] == "no" && $data['previous_vote'] == "yes") {
        $sql = "UPDATE yes_no SET answer_yes = 0, answer_no=1 WHERE post_id='$data[post_id]' AND user_id='$_SESSION[id]'";       
        mysqli_query($conn, $sql);
        echo "Success";
    }
    else if($data['current_vote'] == "no" && $data['previous_vote'] == "nothing")
    {
        $sql = "SELECT post_id,user_id FROM yes_no WHERE post_id='$data[post_id]' AND user_id='$_SESSION[id]'"; 
        $result = mysqli_query($conn, $sql);
        if($result->num_rows > 0)
        {
            $sql = "UPDATE yes_no SET answer_no = 1 WHERE post_id='$data[post_id]' AND user_id='$_SESSION[id]'";       
            mysqli_query($conn, $sql);
            echo "Success";
        }
        else if($result->num_rows == 0)
        {
            $sql = "INSERT INTO yes_no(post_id,user_id,post_category,answer_yes,answer_no) VALUES ('$data[post_id]','$_SESSION[id]',1,0,1)";       
            mysqli_query($conn, $sql);
            echo "Success";
        }
    }
}
else if($data['request'] == "bookmark")
{
    require_once "config.php";

    if($data['current_state'] == "checked" && $data['previous_state'] == "checked")
    {
        $sql = "UPDATE bookmarks SET user_bookmark = 0 WHERE post_id='$data[post_id]' AND user_id='$_SESSION[id]'";       
        mysqli_query($conn, $sql);
        echo "Success";
    }
    else if ($data['current_state'] == "checked" && $data['previous_state'] == "not_checked") {
        $sql = "SELECT post_id,user_id FROM bookmarks WHERE post_id='$data[post_id]' AND user_id='$_SESSION[id]'"; 
        $result = mysqli_query($conn, $sql);
        if($result->num_rows > 0)
        {
            $sql = "UPDATE bookmarks SET user_bookmark = 1 WHERE post_id='$data[post_id]' AND user_id='$_SESSION[id]'";       
            mysqli_query($conn, $sql);
            echo "Success";
        }
        else if($result->num_rows == 0)
        {
            $sql = "INSERT INTO bookmarks(post_id,user_id,user_bookmark) VALUES ('$data[post_id]','$_SESSION[id]',1)";       
            mysqli_query($conn, $sql);
            echo "Success";
        }
    }
}
?>