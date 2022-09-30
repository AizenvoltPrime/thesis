<?php

// Initialize the session
session_start();
// Include config file
require_once "../config.php";

$map_data = [];
$sql = "SELECT file_data.server_latitude AS server_latitude, 
file_data.server_longitude AS server_longitude, 
COUNT(*) AS number_of_appearances 
FROM file_data INNER JOIN user_files ON file_data.file_number=user_files.file_number 
WHERE file_data.server_latitude IS NOT NULL 
AND file_data.server_longitude IS NOT NULL 
AND response_content_types LIKE '%text/html%' 
AND user_files.user_id = $_SESSION[id]
GROUP BY file_data.server_latitude,file_data.server_longitude";

$result = mysqli_query($conn, $sql);
if($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $map_data[] = (object) [
            "lat" => $row["server_latitude"],
            "lng" => $row["server_longitude"],
            "count" => $row["number_of_appearances"],
        ];
    }
}
echo json_encode($map_data);

?>