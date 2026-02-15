<?php
// Database connection file (dbh.inc.php)

// Host details (adjust these if you changed defaults)
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "hostel_management_system"; // ← change this to your actual database name

// Create connection
$conn = mysqli_connect($servername, $username, $password, $dbname);

// Check connection
if (!$conn) {
    die("Database connection failed: " . mysqli_connect_error());
}
?>
