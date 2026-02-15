<?php
  session_start();
  $servername = "localhost"; // changed from hms.test
  $dBUsername = "root";
  $dBPassword = ""; // changed from "root" to empty string
  $dBName = "hostel_management_system";

  $conn = mysqli_connect($servername, $dBUsername, $dBPassword, $dBName);

  if (!$conn) {
    die("Connection Failed: " . mysqli_connect_error());
  }
?>
