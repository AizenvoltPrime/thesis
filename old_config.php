
<?php

if ($_SERVER['REQUEST_METHOD'] == 'GET' && realpath(__FILE__) == realpath($_SERVER['SCRIPT_FILENAME'])) {
    /*The header to send*/
    header('HTTP/1.0 403 Forbidden', TRUE, 403);

    /*Here we choose the page to redirect users*/
    die(header('location: welcome.php'));
}
define('servername', 'localhost');
define('username', 'root');
define('password', '');
define('dbname', 'project');
$conn = new mysqli(servername, username, password, dbname);

// Check connection
if ($conn === false) {
    die("ERROR: Could not connect. " . mysqli_connect_error());
}

?>