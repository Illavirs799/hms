<?php

if (isset($_POST['signup-submit'])) {
    require 'config.inc.php';  // make sure this connects to your database

    // Collect form data
    $roll = $_POST['student_roll_no'];
    $fname = $_POST['student_fname'];
    $lname = $_POST['student_lname'];
    $mob = $_POST['mobile_no'];
    $dept = $_POST['department'];
    $year = $_POST['year_of_study'];
    $password = $_POST['pwd'];
    $confirmPassword = $_POST['confirmpwd'];

    // Basic validation
    if (empty($roll) || empty($fname) || empty($lname) || empty($mob) || empty($dept) || empty($year) || empty($password) || empty($confirmPassword)) {
        header("Location: ../signup.php?error=emptyfields");
        exit();
    }

    if ($password !== $confirmPassword) {
        header("Location: ../signup.php?error=passwordmismatch");
        exit();
    }

    // ✅ Hash the password securely
    $hashedPwd = password_hash($password, PASSWORD_DEFAULT);

    // ✅ Insert into DB
    $sql = "INSERT INTO Student (Student_id, Fname, Lname, Mob_no, Dept, Year_of_study, Pwd)
            VALUES ('$roll', '$fname', '$lname', '$mob', '$dept', '$year', '$hashedPwd')";

    if (mysqli_query($conn, $sql)) {
        header("Location: ../index.php?signup=success");
        exit();
    } else {
        header("Location: ../signup.php?error=sqlerror");
        exit();
    }
}
else {
    header("Location: ../signup.php");
    exit();
}
