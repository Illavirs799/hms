<?php
  //session_start();
  require 'includes/config.inc.php';
?>

<!DOCTYPE html>
<html lang="en">
<head>
<title> Intrend Interior Category Flat Bootstrap Responsive Website Template | Services : W3layouts</title>
	
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta charset="utf-8">

	<link rel="stylesheet" href="web_home/css_home/bootstrap.css">
	<link rel="stylesheet" href="web_home/css_home/style.css" type="text/css" media="all" />
	<link rel="stylesheet" href="web_home/css_home/fontawesome-all.css">

</head>

<body>

<div class="inner-page-banner" id="home"> 	   
	<header>
		<div class="container agile-banner_nav">
			<nav class="navbar navbar-expand-lg navbar-light bg-light">
				
				<h1><a class="navbar-brand" href="home.php">VVIT <span class="display"></span></a></h1>
				<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent">
					<span class="navbar-toggler-icon"></span>
				</button>

				<div class="collapse navbar-collapse justify-content-center" id="navbarSupportedContent">
					<ul class="navbar-nav ml-auto">
						<li class="nav-item">
							<a class="nav-link" href="home.php">Home</a>
						</li>
						<li class="nav-item active">
							<a class="nav-link" href="services.php">Hostels</a>
						</li>
						<li class="nav-item">
							<a class="nav-link" href="contact.php">Contact</a>
						</li>
						<li class="nav-item">
							<a class="nav-link" href="message_user.php">Message Received</a>
						</li>

						<li class="dropdown nav-item">
							<a href="#" class="dropdown-toggle nav-link" data-toggle="dropdown">
								<?php echo $_SESSION['roll']; ?>
								<b class="caret"></b>
							</a>
							<ul class="dropdown-menu agile_short_dropdown">
								<li><a href="profile.php">My Profile</a></li>
								<li><a href="includes/logout.inc.php">Logout</a></li>
							</ul>
						</li>

					</ul>
				</div>
			  
			</nav>
		</div>
	</header>
</div>


<section class="contact py-5">
	<div class="container">
		<h2 class="heading text-capitalize mb-sm-5 mb-4"> Application Form </h2>

		<div class="mail_grid_w3l">

			<form action="application_form.php?id=<?php echo $_GET['id'] ?? ''; ?>" method="post">

				<div class="row">

					<div class="col-md-6 contact_left_grid">

						<div class="contact-fields-w3ls">
							<input type="text" name="Name" placeholder="Name" 
							value="<?php echo $_SESSION['fname'].' '.$_SESSION['lname']; ?>" 
							required disabled>
						</div>

						<div class="contact-fields-w3ls">
							<input type="text" name="roll_no" placeholder="Roll Number" 
							value="<?php echo $_SESSION['roll']; ?>" 
							required disabled>
						</div>

						<div class="contact-fields-w3ls">
							<input type="text" name="hostel" placeholder="Hostel" 
							value="<?php echo $_GET['id'] ?? ''; ?>" disabled>
						</div>

						<div class="contact-fields-w3ls">
							<input type="password" name="pwd" placeholder="Password" required>
						</div>

					</div>

					<div class="col-md-6 contact_left_grid">

						<div class="contact-fields-w3ls">
							<textarea name="Message" placeholder="Message..."></textarea>
						</div>

						<input type="submit" name="submit" value="Click to Apply">

					</div>

				</div>

			</form>

		</div>

	</div>
</section>


<footer class="py-5">
	<div class="container py-md-5">

		<div class="footer-logo mb-5 text-center">
			<a class="navbar-brand" href="https://www.vvitguntur.com/" target="_blank">
				VVIT <span class="display"> Nambur</span>
			</a>
		</div>

		<div class="list-footer">
			<ul class="footer-nav text-center">
				<li><a href="home.php">Home</a></li>
				<li><a href="services.php">Hostels</a></li>
				<li><a href="contact.php">Contact</a></li>
				<li><a href="profile.php">Profile</a></li>
			</ul>
		</div>

	</div>
</footer>


<script type="text/javascript" src="web_home/js/jquery-2.2.3.min.js"></script>
<script type="text/javascript" src="web_home/js/bootstrap.js"></script>

</body>
</html>


<?php

if(isset($_POST['submit'])){

	$roll = $_SESSION['roll'];
	$password = $_POST['pwd'];
	$hostel = $_GET['id'] ?? '';
	$message = $_POST['Message'];

	$query_imp = "SELECT * FROM Student WHERE Student_id = '$roll'";
	$result_imp = mysqli_query($conn,$query_imp);
	$row_imp = mysqli_fetch_assoc($result_imp);
	$room_id = $row_imp['Room_id'];

	if(is_null($room_id)){

		$query_imp2 = "SELECT * FROM Application WHERE Student_id = '$roll'";
		$result_imp2 = mysqli_query($conn,$query_imp2);

		if(mysqli_num_rows($result_imp2) == 0){

			$query = "SELECT * FROM Student WHERE Student_id = '$roll'";
			$result = mysqli_query($conn,$query);

			if($row = mysqli_fetch_assoc($result)){

				$pwdCheck = password_verify($password, $row['Pwd']);

				if($pwdCheck == false){
					echo "<script>alert('Incorrect Password!!');</script>";
				}
				else{

					// Look up hostel using Hostel_id
					$query2 = "SELECT * FROM Hostel WHERE Hostel_id = '$hostel'";
					$result2 = mysqli_query($conn,$query2);
					$row2 = mysqli_fetch_assoc($result2);
					$hostel_id = $row2['Hostel_id'];

					$query3 = "INSERT INTO Application (Student_id,Hostel_id,Application_status,Message)
							   VALUES ('$roll','$hostel_id',true,'$message')";
					
					$result3 = mysqli_query($conn,$query3);

					if($result3){
						echo "<script>alert('Application sent successfully');</script>";
					}
				}
			}

		}
		else{
			echo "<script>alert('You have Already applied for a Room');</script>";
		}

	}
	else{
		echo "<script>alert('You have Already been alloted a Room');</script>";
	}

}

?>
