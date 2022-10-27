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
    else if($_SESSION["role"] == "admin")
    {
        echo "admin";
    }
}
else if($data["request"] == "username_change" && isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] == true){
    require_once "old_config.php";
    $new_username=$data['username'];

    $sql = "SELECT username FROM user WHERE username = ?";
        
    if($stmt = mysqli_prepare($conn, $sql)){
        mysqli_stmt_bind_param($stmt, "s", $new_username);
            
        if(mysqli_stmt_execute($stmt)){
            mysqli_stmt_store_result($stmt);
            if(mysqli_stmt_num_rows($stmt) == 1){
                echo "Username Unavailable!";
                mysqli_stmt_close($stmt);
            }
            else {
                mysqli_stmt_close($stmt);

                $sql = "SELECT id, username, password, role FROM user WHERE username = ?";
                if($stmt = mysqli_prepare($conn, $sql)){
                    mysqli_stmt_bind_param($stmt, "s", $_SESSION['username']);

                    if(mysqli_stmt_execute($stmt)){
                        mysqli_stmt_store_result($stmt);
                        if(mysqli_stmt_num_rows($stmt) == 1){  
                            mysqli_stmt_bind_result($stmt, $id, $username, $hashed_password, $role);
                            if(mysqli_stmt_fetch($stmt)){
                                if(password_verify($data['password'], $hashed_password)){
                                    mysqli_stmt_close($stmt);

                                    $sql = "UPDATE user SET username = ? WHERE id = ?";
                                    
                                    if($stmt = mysqli_prepare($conn, $sql)){
                                    // Bind variables to the prepared statement as parameters
                                    mysqli_stmt_bind_param($stmt, "si", $data['username'], $_SESSION['id']);
                                    // Attempt to execute the prepared statement
                                    if(mysqli_stmt_execute($stmt)){
                                        // Username updated successfully. Destroy the session, and redirect to login page
                                        $_SESSION["username"] = $data['username'];
                                        echo "Success";
                                    } else{
                                        echo "Oops! Something went wrong. Please try again later.";
                                    }
                                    // Close statement
                                    mysqli_stmt_close($stmt);
                                    }
                                }
                                else {
                                    echo "Incorrect Password!";
                                }
                            }
                        }
                    }
                }

            }
        } 
        else{
            echo "Oops! Something went wrong. Please try again later.";
        }
            
        // Close statement
        mysqli_close($conn);
    }
}
else if($data["request"] == "password_change" && isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] == true)
{
    require_once "old_config.php";

    $sql = "SELECT password FROM user WHERE username = ?";
        
    if($stmt = mysqli_prepare($conn, $sql)){
        mysqli_stmt_bind_param($stmt, "s", $_SESSION['username']);
            
        if(mysqli_stmt_execute($stmt)){
            mysqli_stmt_store_result($stmt);
            if(mysqli_stmt_num_rows($stmt) == 1){  
                mysqli_stmt_bind_result($stmt, $hashed_password);
                if(mysqli_stmt_fetch($stmt)){
                    if(password_verify($data['current_password'], $hashed_password)){
                        mysqli_stmt_close($stmt);
                        $sql = "UPDATE user SET password = ? WHERE id = ?";        
                        if($stmt = mysqli_prepare($conn, $sql)){
                            mysqli_stmt_bind_param($stmt, "si", $param_password, $_SESSION['id']);
                            $param_password = password_hash($data["new_password"], PASSWORD_DEFAULT);
                            if(mysqli_stmt_execute($stmt)){
                                echo "Success";
                            } else{
                                echo "Oops! Something went wrong. Please try again later.";
                            }
                            // Close statement
                            mysqli_stmt_close($stmt);
                        }
                    }
                    else {
                        echo "Incorrect Password!";
                    }
                }
            }
        }
    } 
        else{
            echo "Oops! Something went wrong. Please try again later.";
        }
            
        // Close statement
        mysqli_close($conn);
}
else if($data['request'] == "upload_post_data" && isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] == true)
{
    require_once "old_config.php";
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
    if($data['time_limiter']=="")
    {
        $data['time_limiter']=null;
    }
    $sql = "INSERT INTO posts (user_id, poll_type, post_category, post_text, post_date, post_expiration_date, event_lat, event_long, event_radius) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    if ($stmt = mysqli_prepare($conn, $sql)){
        // Bind variables to the prepared statement as parameters
        mysqli_stmt_bind_param($stmt, "iiisssddi", $param_userID, $param_poll_type, $data['post_category'], $param_text, $param_date, $data['time_limiter'],$data['event_lat'],$data['event_long'],$data['event_rad']);
        $param_userID = $_SESSION["id"];
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
        mysqli_close($conn);
    }
}
else if($data['request'] == "get_post_data")
{
    require "new_config.php";
    $post_data=array();

    if(!isset($data["user_search"]))
    {
        $user_search="%";
    }
    else {
        $user_search=str_replace(["=", "%", "_"], ["==", "=%", "=_"], $data["user_search"]);
        $user_search= "%" . $user_search . "%";
    }

    if(!isset($data["filter_preferred_categories"]))
    {
        $filter_preferred_categories = ".";
    }
    else{
        for ($i = 0; $i < count($data["filter_preferred_categories"]); $i++) {
            if($i==0)
            {
                $filter_preferred_categories=$data["filter_preferred_categories"][$i];
            }
            else {
                $filter_preferred_categories.= "|" . $data["filter_preferred_categories"][$i];
            }
        }
    }

    if(!isset($data["filter_search"]))
    {
        $filter_search="%";
    }
    else {
        $filter_search = str_replace(["=", "%", "_"], ["==", "=%", "=_"], $data["filter_search"]);
        $filter_search="%" . $filter_search . "%";
    }

    if(!isset($data["filter_filter"][0]))
    {
        $filter_filter_time=array("2020-01-01 00:00","2090-01-01 00:00");
    }
    else{
        $filter_filter_time=explode(",", $data["filter_filter"][0]);
    }

    if(!isset($data["filter_filter"][1]))
    {
        $filter_filter_poll_type=".";
    }
    else{
        for ($i = 0; $i < count($data["filter_filter"][1]); $i++) {
            if($i==0)
            {
                $filter_filter_poll_type = $data["filter_filter"][1][$i];
            }
            else {
                $filter_filter_poll_type.= "|" . $data["filter_filter"][1][$i];
            }
        }
    }

    if(!isset($data["filter_filter"][2]))
    {
        $filter_filter_user="%";
    }
    else{
        $filter_filter_user=str_replace(["=", "%", "_"], ["==", "=%", "=_"], $data["filter_filter"][2]);
        $filter_filter_user="%" .  $filter_filter_user . "%";
    }

    date_default_timezone_set('Europe/Athens');
    $current_datetime = date('Y-m-d H:i:s', time());
    if(!isset($data["filter_filter"][3]))
    {
        $filter_filter_poll_status="1=1";
    }
    else if($data["filter_filter"][3]=="1"){
        $filter_filter_poll_status="post_expiration_date IS NULL OR post_expiration_date > " . "'" . $current_datetime . "'";
    }
    else if($data["filter_filter"][3]=="2"){
        $filter_filter_poll_status="post_expiration_date < " . "'" . $current_datetime . "'";
    }
    if(isset($_SESSION['id']))
    {
        if($data["bookmarks_only"]==false)
        {
            if(isset($data["filter_hot"]) && $data["filter_hot"]=="hot")
            {
                $stmt=$conn->prepare("SELECT posts.post_number AS post_number, user.username AS username, polls.poll_id AS poll_id, categories.category_name AS category_name,
                    posts.post_text AS post_text, sum(chevron_vote.chevron_result) AS chevron_result, posts.post_date AS post_date, 
                    COALESCE((SELECT chevron_vote.chevron_result FROM chevron_vote WHERE chevron_vote.user_id=:id AND chevron_vote.post_id=post_number),0) AS user_chevron_result,
                    COALESCE((SELECT yes_no.answer_yes FROM yes_no WHERE yes_no.user_id=:id AND yes_no.post_id=post_number),0) AS user_yes_answer,
                    COALESCE((SELECT yes_no.answer_no FROM yes_no WHERE yes_no.user_id=:id AND yes_no.post_id=post_number),0) AS user_no_answer,
                    COALESCE((SELECT bookmarks.user_bookmark FROM bookmarks WHERE bookmarks.user_id=:id AND bookmarks.post_id=post_number),0) AS user_bookmark,
                    posts.post_expiration_date AS post_expiration_date, posts.event_lat AS event_lat, posts.event_long AS event_long, posts.event_radius AS event_radius
                    FROM posts join user on posts.user_id = user.id join polls on posts.poll_type = polls.poll_id join categories
                    on posts.post_category = categories.category_id join chevron_vote ON posts.post_number = chevron_vote.post_id 
                    WHERE username LIKE :username ESCAPE '=' AND category_name RLIKE :category_name AND post_text LIKE :filter_search ESCAPE '=' 
                    AND (post_date BETWEEN :first_date AND :second_date) AND poll_id RLIKE :filter_poll_type AND username LIKE :filter_username ESCAPE '=' 
                    AND $filter_filter_poll_status
                    GROUP BY posts.post_number ORDER BY chevron_result DESC, posts.post_date DESC");
            }
            else{
                $stmt=$conn->prepare("SELECT posts.post_number AS post_number, user.username AS username, polls.poll_id AS poll_id, categories.category_name AS category_name,
                    posts.post_text AS post_text, sum(chevron_vote.chevron_result) AS chevron_result, posts.post_date AS post_date, 
                    COALESCE((SELECT chevron_vote.chevron_result FROM chevron_vote WHERE chevron_vote.user_id=:id AND chevron_vote.post_id=post_number),0) AS user_chevron_result,
                    COALESCE((SELECT yes_no.answer_yes FROM yes_no WHERE yes_no.user_id=:id AND yes_no.post_id=post_number),0) AS user_yes_answer,
                    COALESCE((SELECT yes_no.answer_no FROM yes_no WHERE yes_no.user_id=:id AND yes_no.post_id=post_number),0) AS user_no_answer,
                    COALESCE((SELECT bookmarks.user_bookmark FROM bookmarks WHERE bookmarks.user_id=:id AND bookmarks.post_id=post_number),0) AS user_bookmark,
                    posts.post_expiration_date AS post_expiration_date, posts.event_lat AS event_lat, posts.event_long AS event_long, posts.event_radius AS event_radius
                    FROM posts join user on posts.user_id = user.id join polls on posts.poll_type = polls.poll_id join categories 
                    on posts.post_category = categories.category_id join chevron_vote ON posts.post_number = chevron_vote.post_id 
                    WHERE username LIKE :username ESCAPE '=' AND category_name RLIKE :category_name AND post_text LIKE :filter_search ESCAPE '=' 
                    AND (post_date BETWEEN :first_date AND :second_date) AND poll_id RLIKE :filter_poll_type AND username LIKE :filter_username ESCAPE '=' 
                    AND $filter_filter_poll_status
                    GROUP BY posts.post_number ORDER BY posts.post_date DESC"); 
            }
        }
        else if($data["bookmarks_only"]==true)
        {
            if(isset($data["filter_hot"]) && $data["filter_hot"]=="hot")
            {
                $stmt=$conn->prepare("SELECT posts.post_number AS post_number, user.username AS username, polls.poll_id AS poll_id, categories.category_name AS category_name,
                    posts.post_text AS post_text, sum(chevron_vote.chevron_result) AS chevron_result, posts.post_date AS post_date, 
                    COALESCE((SELECT chevron_vote.chevron_result FROM chevron_vote WHERE chevron_vote.user_id=:id AND chevron_vote.post_id=post_number),0) AS user_chevron_result,
                    COALESCE((SELECT yes_no.answer_yes FROM yes_no WHERE yes_no.user_id=:id AND yes_no.post_id=post_number),0) AS user_yes_answer,
                    COALESCE((SELECT yes_no.answer_no FROM yes_no WHERE yes_no.user_id=:id AND yes_no.post_id=post_number),0) AS user_no_answer,
                    COALESCE((SELECT bookmarks.user_bookmark FROM bookmarks WHERE bookmarks.user_id=:id AND bookmarks.post_id=post_number),0) AS user_bookmark,
                    posts.post_expiration_date AS post_expiration_date, posts.event_lat AS event_lat, posts.event_long AS event_long, posts.event_radius AS event_radius
                    FROM posts join user on posts.user_id = user.id join polls on posts.poll_type = polls.poll_id join categories 
                    on posts.post_category = categories.category_id join chevron_vote ON posts.post_number = chevron_vote.post_id
                    WHERE COALESCE((SELECT bookmarks.user_bookmark FROM bookmarks WHERE bookmarks.user_id=:id AND bookmarks.post_id=post_number),0) = 1 
                    AND username LIKE :username ESCAPE '=' AND category_name RLIKE :category_name AND post_text LIKE :filter_search ESCAPE '=' 
                    AND (post_date BETWEEN :first_date AND :second_date) AND poll_id RLIKE :filter_poll_type AND username LIKE :filter_username ESCAPE '=' 
                    AND $filter_filter_poll_status
                    GROUP BY posts.post_number ORDER BY chevron_result DESC, posts.post_date DESC");
            }
            else{
                $stmt=$conn->prepare("SELECT posts.post_number AS post_number, user.username AS username, polls.poll_id AS poll_id, categories.category_name AS category_name,
                    posts.post_text AS post_text, sum(chevron_vote.chevron_result) AS chevron_result, posts.post_date AS post_date, 
                    COALESCE((SELECT chevron_vote.chevron_result FROM chevron_vote WHERE chevron_vote.user_id=:id AND chevron_vote.post_id=post_number),0) AS user_chevron_result,
                    COALESCE((SELECT yes_no.answer_yes FROM yes_no WHERE yes_no.user_id=:id AND yes_no.post_id=post_number),0) AS user_yes_answer,
                    COALESCE((SELECT yes_no.answer_no FROM yes_no WHERE yes_no.user_id=:id AND yes_no.post_id=post_number),0) AS user_no_answer,
                    COALESCE((SELECT bookmarks.user_bookmark FROM bookmarks WHERE bookmarks.user_id=:id AND bookmarks.post_id=post_number),0) AS user_bookmark,
                    posts.post_expiration_date AS post_expiration_date, posts.event_lat AS event_lat, posts.event_long AS event_long, posts.event_radius AS event_radius
                    FROM posts join user on posts.user_id = user.id join polls on posts.poll_type = polls.poll_id join categories 
                    on posts.post_category = categories.category_id join chevron_vote ON posts.post_number = chevron_vote.post_id
                    WHERE COALESCE((SELECT bookmarks.user_bookmark FROM bookmarks WHERE bookmarks.user_id=:id AND bookmarks.post_id=post_number),0) = 1 
                    AND username LIKE :username ESCAPE '=' AND category_name RLIKE :category_name AND post_text LIKE :filter_search ESCAPE '=' 
                    AND (post_date BETWEEN :first_date AND :second_date) AND poll_id RLIKE :filter_poll_type AND username LIKE :filter_username ESCAPE '=' 
                    AND $filter_filter_poll_status
                    GROUP BY posts.post_number ORDER BY posts.post_date DESC");
            }
        }

        $stmt->execute([":id"=>$_SESSION["id"],":username"=>$user_search,":category_name"=>$filter_preferred_categories,":filter_search"=>$filter_search,
            ":first_date"=>$filter_filter_time[0],":second_date"=>$filter_filter_time[1],":filter_poll_type"=>$filter_filter_poll_type
            ,":filter_username"=>$filter_filter_user]);
        while($row=$stmt->fetch(PDO::FETCH_ASSOC)){
            $tmp=array($row["post_number"],$row["username"], $row["poll_id"],$row["category_name"],$row["post_text"],$row["chevron_result"],
            $row["post_date"],$row["user_chevron_result"],$row["user_yes_answer"],$row["user_no_answer"],$row["user_bookmark"],$row["post_expiration_date"],
            $row["event_lat"],$row["event_long"],$row["event_radius"]);
            array_push($post_data,$tmp);
        }
        echo json_encode($post_data);
    }
    else {
        if(isset($data["filter_hot"]) && $data["filter_hot"]=="hot")
        {
            $stmt=$conn->prepare("SELECT post_number,username,poll_id,category_name,post_text,chevron_result,post_date,post_expiration_date FROM posts_info 
            WHERE username LIKE :username ESCAPE '=' AND category_name RLIKE :category_name AND post_text LIKE :filter_search ESCAPE '=' 
            AND (post_date BETWEEN :first_date AND :second_date) AND poll_id RLIKE :filter_poll_type AND username LIKE :filter_username ESCAPE '=' 
            AND $filter_filter_poll_status ORDER BY chevron_result DESC");
        }
        else {
            $stmt=$conn->prepare("SELECT post_number,username,poll_id,category_name,post_text,chevron_result,post_date,post_expiration_date FROM posts_info 
            WHERE username LIKE :username ESCAPE '=' AND category_name RLIKE :category_name AND post_text LIKE :filter_search ESCAPE '=' 
            AND (post_date BETWEEN :first_date AND :second_date) AND poll_id RLIKE :filter_poll_type AND username LIKE :filter_username ESCAPE '=' 
            AND $filter_filter_poll_status");
        }


        $stmt->execute([":username"=>$user_search,":category_name"=>$filter_preferred_categories,":filter_search"=>$filter_search,
            ":first_date"=>$filter_filter_time[0],":second_date"=>$filter_filter_time[1],":filter_poll_type"=>$filter_filter_poll_type
            ,":filter_username"=>$filter_filter_user]);
        while($row=$stmt->fetch(PDO::FETCH_ASSOC)){
            $tmp=array($row["post_number"],$row["username"], $row["poll_id"],$row["category_name"],$row["post_text"],$row["chevron_result"],$row["post_date"],$row["post_expiration_date"]);
            array_push($post_data,$tmp);
        }
        echo json_encode($post_data);
    }
}
else if($data['request'] == "chevron_vote" && isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] == true)
{
    require_once "new_config.php";

    if($data['direction'] == "up" && $data['previous_vote'] == "up")
    {
        $stmt=$conn->prepare("UPDATE chevron_vote SET chevron_result = 0 WHERE post_id=:post_id AND user_id=:id");  
        $stmt->execute([":post_id"=>$data["post_id"],":id"=>$_SESSION["id"]]);     
        echo "Success";
    }
    else if ($data['direction'] == "up" && $data['previous_vote'] == "down") {
        $stmt=$conn->prepare("UPDATE chevron_vote SET chevron_result = 1 WHERE post_id=:post_id AND user_id=:id");       
        $stmt->execute([":post_id"=>$data["post_id"],":id"=>$_SESSION["id"]]);   
        echo "Success";
    }
    else if($data['direction'] == "up" && $data['previous_vote'] == "no")
    {
        $stmt=$conn->prepare("SELECT post_id,user_id FROM chevron_vote WHERE post_id=:post_id AND user_id=:id"); 
        $stmt->execute([":post_id"=>$data["post_id"],":id"=>$_SESSION["id"]]);
        if($stmt->rowCount() > 0)
        {
            $stmt=$conn->prepare("UPDATE chevron_vote SET chevron_result = 1 WHERE post_id=:post_id AND user_id=:id");       
            $stmt->execute([":post_id"=>$data["post_id"],":id"=>$_SESSION["id"]]);
            echo "Success";
        }
        else if($stmt->rowCount() == 0)
        {
            $stmt=$conn->prepare("INSERT INTO chevron_vote(post_id,user_id,chevron_result) VALUES (:post_id,:id,1)");       
            $stmt->execute([":post_id"=>$data["post_id"],":id"=>$_SESSION["id"]]);
            echo "Success";
        }
    }
    else if($data['direction'] == "down" && $data['previous_vote'] == "down")
    {
        $stmt=$conn->prepare("UPDATE chevron_vote SET chevron_result = 0 WHERE post_id=:post_id AND user_id=:id");       
        $stmt->execute([":post_id"=>$data["post_id"],":id"=>$_SESSION["id"]]);
        echo "Success";
    }
    else if($data['direction'] == "down" && $data['previous_vote'] == "up")
    {
        $stmt=$conn->prepare("UPDATE chevron_vote SET chevron_result = -1 WHERE post_id=:post_id AND user_id=:id");       
        $stmt->execute([":post_id"=>$data["post_id"],":id"=>$_SESSION["id"]]);
        echo "Success";
    }
    else if($data['direction'] == "down" && $data['previous_vote'] == "no")
    {
        $stmt=$conn->prepare("SELECT post_id,user_id FROM chevron_vote WHERE post_id=:post_id AND user_id=:id"); 
        $stmt->execute([":post_id"=>$data["post_id"],":id"=>$_SESSION["id"]]);
        if($stmt->rowCount() > 0)
        {
            $stmt=$conn->prepare("UPDATE chevron_vote SET chevron_result = -1 WHERE post_id=:post_id AND user_id=:id");       
            $stmt->execute([":post_id"=>$data["post_id"],":id"=>$_SESSION["id"]]);
            echo "Success";
        }
        else if($stmt->rowCount() == 0)
        {
            $stmt=$conn->prepare("INSERT INTO chevron_vote(post_id,user_id,chevron_result) VALUES (:post_id,:id,-1)");       
            $stmt->execute([":post_id"=>$data["post_id"],":id"=>$_SESSION["id"]]);
            echo "Success";
        }
    }
}
else if($data['request'] == "yes_no_vote" && isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] == true)
{
    require_once "new_config.php";

    if($data['current_vote'] == "yes" && $data['previous_vote'] == "yes")
    {
        $stmt=$conn->prepare("UPDATE yes_no SET answer_yes = 0 WHERE post_id=:post_id AND user_id=:id");       
        $stmt->execute([":post_id"=>$data["post_id"],":id"=>$_SESSION["id"]]);
        echo "Success";
    }
    else if ($data['current_vote'] == "yes" && $data['previous_vote'] == "no") {
        $stmt=$conn->prepare("UPDATE yes_no SET answer_yes = 1, answer_no=0 WHERE post_id=:post_id AND user_id=:id");       
        $stmt->execute([":post_id"=>$data["post_id"],":id"=>$_SESSION["id"]]);
        echo "Success";
    }
    else if($data['current_vote'] == "yes" && $data['previous_vote'] == "nothing")
    {
        $stmt=$conn->prepare("SELECT post_id,user_id FROM yes_no WHERE post_id=:post_id AND user_id=:id"); 
        $stmt->execute([":post_id"=>$data["post_id"],":id"=>$_SESSION["id"]]);
        if($stmt->rowCount() > 0)
        {
            $stmt=$conn->prepare("UPDATE yes_no SET answer_yes = 1 WHERE post_id=:post_id AND user_id=:id");       
            $stmt->execute([":post_id"=>$data["post_id"],":id"=>$_SESSION["id"]]);
            echo "Success";
        }
        else if($stmt->rowCount() == 0)
        {
            $stmt=$conn->prepare("INSERT INTO yes_no(post_id,user_id,poll_type,answer_yes,answer_no) VALUES (:post_id,:id,1,1,0)");       
            $stmt->execute([":post_id"=>$data["post_id"],":id"=>$_SESSION["id"]]);
            echo "Success";
        }
    }
    else if($data['current_vote'] == "no" && $data['previous_vote'] == "no")
    {
        $stmt=$conn->prepare("UPDATE yes_no SET answer_no = 0 WHERE post_id=:post_id AND user_id=:id");       
        $stmt->execute([":post_id"=>$data["post_id"],":id"=>$_SESSION["id"]]);
        echo "Success";
    }
    else if ($data['current_vote'] == "no" && $data['previous_vote'] == "yes") {
        $stmt=$conn->prepare("UPDATE yes_no SET answer_yes = 0, answer_no=1 WHERE post_id=:post_id AND user_id=:id");       
        $stmt->execute([":post_id"=>$data["post_id"],":id"=>$_SESSION["id"]]);
        echo "Success";
    }
    else if($data['current_vote'] == "no" && $data['previous_vote'] == "nothing")
    {
        $stmt=$conn->prepare("SELECT post_id,user_id FROM yes_no WHERE post_id=:post_id AND user_id=:id"); 
        $stmt->execute([":post_id"=>$data["post_id"],":id"=>$_SESSION["id"]]);
        if($stmt->rowCount() > 0)
        {
            $stmt=$conn->prepare("UPDATE yes_no SET answer_no = 1 WHERE post_id=:post_id AND user_id=:id");       
            $stmt->execute([":post_id"=>$data["post_id"],":id"=>$_SESSION["id"]]);
            echo "Success";
        }
        else if($stmt->rowCount() == 0)
        {
            $stmt=$conn->prepare("INSERT INTO yes_no(post_id,user_id,poll_type,answer_yes,answer_no) VALUES (:post_id,:id,1,0,1)");       
            $stmt->execute([":post_id"=>$data["post_id"],":id"=>$_SESSION["id"]]);
            echo "Success";
        }
    }
}
else if($data['request'] == "bookmark" && isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] == true)
{
    require_once "new_config.php";

    if($data['current_state'] == "checked" && $data['previous_state'] == "checked")
    {
        $stmt=$conn->prepare("UPDATE bookmarks SET user_bookmark = 0 WHERE post_id=:post_id AND user_id=:id");       
        $stmt->execute([":post_id"=>$data["post_id"],":id"=>$_SESSION["id"]]);
        echo "Success";
    }
    else if ($data['current_state'] == "checked" && $data['previous_state'] == "not_checked") {
        $stmt=$conn->prepare("SELECT post_id,user_id FROM bookmarks WHERE post_id=:post_id AND user_id=:id"); 
        $stmt->execute([":post_id"=>$data["post_id"],":id"=>$_SESSION["id"]]);
        if($stmt->rowCount() > 0)
        {
            $stmt=$conn->prepare("UPDATE bookmarks SET user_bookmark = 1 WHERE post_id=:post_id AND user_id=:id");       
            $stmt->execute([":post_id"=>$data["post_id"],":id"=>$_SESSION["id"]]);
            echo "Success";
        }
        else if($stmt->rowCount() == 0)
        {
            $stmt=$conn->prepare("INSERT INTO bookmarks(post_id,user_id,user_bookmark) VALUES (:post_id,:id,1)");       
            $stmt->execute([":post_id"=>$data["post_id"],":id"=>$_SESSION["id"]]);
            echo "Success";
        }
    }
}
else if($data['request'] == "yes_no_data")
{
    require_once "new_config.php";

    $stmt=$conn->prepare("SELECT number_of_yes,number_of_no FROM posts_yes_no_info WHERE post_number=:post_id"); 
    $stmt->execute([":post_id"=>$data["post_id"]]);
    if($stmt->rowCount() > 0) {
        while($row=$stmt->fetch(PDO::FETCH_ASSOC)) {
            $tmp = array($row["number_of_yes"],$row["number_of_no"]);
        }
    }
    echo json_encode($tmp);
}
else if($data['request'] == "location_responses_data" && isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] == true)
{
    require_once "new_config.php";

    $location_responses_data = array();

    $stmt=$conn->prepare("SELECT posts.post_loc_lat AS post_latitude, posts.post_loc_long AS post_longitude, (SELECT COUNT(post_number) FROM posts WHERE posts.post_loc_lat=post_latitude 
    AND post_loc_long=post_longitude GROUP BY post_loc_lat,post_loc_long) AS number_of_posts_in_location,(SELECT COUNT(yes_no.post_id) FROM yes_no 
    INNER JOIN posts ON yes_no.post_id=posts.post_number WHERE (yes_no.answer_yes=1 OR yes_no.answer_no=1) AND posts.post_loc_lat=post_latitude 
    AND posts.post_loc_long=post_longitude) AS number_of_responses_in_location 
    FROM posts INNER JOIN yes_no ON posts.post_number=yes_no.post_id GROUP BY post_loc_lat,post_loc_long"); 
    $stmt->execute();  
        if($stmt->rowCount() > 0) {
            while($row=$stmt->fetch(PDO::FETCH_ASSOC)) {
                $tmp = array($row["post_latitude"],$row["post_longitude"], $row["number_of_posts_in_location"],$row["number_of_responses_in_location"]);
                array_push($location_responses_data,$tmp);
            }
        }
    echo json_encode($location_responses_data);
}
?>