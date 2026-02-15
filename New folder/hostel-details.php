<?php
// hostel-details.php (replace your file with this)
// show errors for debugging
require 'includes/dbh.inc.php';
ini_set('display_errors', 1);
error_reporting(E_ALL);

if (session_status() === PHP_SESSION_NONE) session_start();

// include DB connection (try includes/ then root)
$included = false;
if (file_exists(__DIR__ . '/includes/dbh.inc.php')) {
    include __DIR__ . '/includes/dbh.inc.php';
    $included = true;
} elseif (file_exists(__DIR__ . '/dbh.inc.php')) {
    include __DIR__ . '/dbh.inc.php';
    $included = true;
}

if (!$included || !isset($conn) || !$conn) {
    // friendly error with steps
    echo "<h2 style='color:red; text-align:center; margin-top:30px;'>Database connection not found.</h2>";
    echo "<p style='text-align:center;'>Create <code>includes/dbh.inc.php</code> (or <code>dbh.inc.php</code>) with your mysqli connection and try again.</p>";
    exit;
}

if (!isset($_GET['hostel']) || trim($_GET['hostel']) === '') {
    echo "<h3 style='text-align:center; margin-top:30px;'>No hostel selected. <a href='services.php'>Back to hostels</a></h3>";
    exit;
}

$hostel = mysqli_real_escape_string($conn, $_GET['hostel']);

// fetch distinct floors for this hostel using prepared stmt
$sql_floors = "SELECT DISTINCT Floor_no FROM Rooms WHERE Hostel_block = ? ORDER BY Floor_no ASC";
$stmt_f = mysqli_prepare($conn, $sql_floors);
mysqli_stmt_bind_param($stmt_f, 's', $hostel);
mysqli_stmt_execute($stmt_f);
$result_floors = mysqli_stmt_get_result($stmt_f);
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Hostel <?php echo htmlspecialchars($hostel); ?> — Details</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<!-- simple styling -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
<style>
  body { background: linear-gradient(120deg,#f4f6ff,#fef7f0); font-family: Arial, Helvetica, sans-serif; color:#222; }
  header { background: #6f42c1; color: #fff; padding: 18px 10px; text-align:center; box-shadow: 0 4px 18px rgba(0,0,0,0.08); }
  .wrap { max-width:1100px; margin:30px auto; padding:20px; }
  .card-floor { border-radius:12px; background:#fff; padding:18px; box-shadow:0 6px 22px rgba(16,24,40,0.08); margin-bottom:18px; }
  .room-item { display:flex; justify-content:space-between; align-items:center; padding:10px; border-radius:8px; margin:8px 0; background:#fbfbff; transition:transform .12s, box-shadow .12s; }
  .room-item:hover { transform:translateY(-3px); box-shadow:0 10px 30px rgba(16,24,40,0.06); }
  .room-status { font-weight:600; color:#0b5ed7; }
  .room-status.full { color:#d63384; font-weight:700; }
  .apply-btn { background: linear-gradient(90deg,#198754,#28a745); color:#fff; padding:6px 12px; border-radius:8px; text-decoration:none; }
  .apply-btn:hover { opacity:0.95; text-decoration:none; color:#fff; }
  .no-rooms { text-align:center; padding:28px; color:#6c757d; }
  footer { text-align:center; margin-top:20px; color:#6c757d; }
  @media (max-width:575px){ .room-item { flex-direction:column; align-items:flex-start; gap:8px; } }
</style>
</head>
<body>
<header>
  <h1>Hostel Management System</h1>
  <div>Hostel <?php echo htmlspecialchars($hostel); ?> — Floors & Rooms</div>
</header>

<div class="wrap container">
  <?php
  if ($result_floors && mysqli_num_rows($result_floors) > 0) {
      while ($floor = mysqli_fetch_assoc($result_floors)) {
          $floor_no = (int)$floor['Floor_no'];
          // fetch rooms for this hostel & floor
          $sql_rooms = "SELECT Room_id, Hostel_block, Floor_no, Room_no, Capacity, Occupied FROM Rooms WHERE Hostel_block = ? AND Floor_no = ? ORDER BY Room_no ASC";
          $stmt_r = mysqli_prepare($conn, $sql_rooms);
          mysqli_stmt_bind_param($stmt_r, 'si', $hostel, $floor_no);
          mysqli_stmt_execute($stmt_r);
          $result_rooms = mysqli_stmt_get_result($stmt_r);
          ?>
          <div class="card-floor">
            <h4>Floor <?php echo $floor_no; ?></h4>
            <?php
            if ($result_rooms && mysqli_num_rows($result_rooms) > 0) {
                echo "<div>";
                while ($room = mysqli_fetch_assoc($result_rooms)) {
                    $available = (int)$room['Capacity'] - (int)$room['Occupied'];
                    $room_no = htmlspecialchars($room['Room_no']);
                    $statusHtml = ($available > 0)
                        ? "<span class='room-status'>{$available} beds available</span>"
                        : "<span class='room-status full'>Full</span>";
                    // safe URL encoding for parameters
                    $urlRoom = urlencode($room['Room_no']);
                    $urlHostel = urlencode($hostel);
                    ?>
                    <div class="room-item">
                      <div>
                        <strong>Room <?php echo $room_no; ?></strong> &nbsp; - &nbsp; <?php echo $statusHtml; ?>
                      </div>
                      <div>
                        <?php if ($available > 0): ?>
                          <a class="apply-btn" href="application_form.php?room=<?php echo $urlRoom; ?>&hostel=<?php echo $urlHostel; ?>">Apply</a>
                        <?php else: ?>
                          <span style="color:#888; font-size:14px;">Not available</span>
                        <?php endif; ?>
                      </div>
                    </div>
                <?php
                }
                echo "</div>";
            } else {
                echo "<div class='no-rooms'>No rooms found on this floor.</div>";
            }
            mysqli_stmt_close($stmt_r);
            ?>
          </div>
    <?php
      } // end floors loop
  } else {
      echo "<div class='card-floor'><p class='no-rooms'>No rooms found for Hostel " . htmlspecialchars($hostel) . ".</p></div>";
  }
  mysqli_stmt_close($stmt_f);
  ?>
  <div style="text-align:right; margin-top:8px;"><a href="services.php">← Back to Hostels</a></div>
</div>

<footer>
  &copy; <?php echo date('Y'); ?> Hostel Management System
</footer>

</body>
</html>
