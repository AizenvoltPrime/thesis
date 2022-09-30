<?php

// Initialize the session
session_start();
// Include config file
require_once "../config.php";
//Statistics
$sql = "SELECT max(upload_date) as last_upload, sum(entries) as total_entries FROM user_files WHERE user_id = $_SESSION[id]";

$result = mysqli_query($conn, $sql);
if($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        if($row["last_upload"] != null && $row["total_entries"] != null)
        {
            echo $row["last_upload"] . "+" . $row["total_entries"];
        }
        else {
            echo "-" . "+" . "-";
        }
    }
}
else{
    $last_upload=0;
    $total_entries=0;
}
?>