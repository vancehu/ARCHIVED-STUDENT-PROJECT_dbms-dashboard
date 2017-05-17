<?php 
$DB_LOG_HOST = $_ENV["DEMO_MYSQL_PORT_3306_TCP_ADDR"];
$DB_LOG_USER = "root";
$DB_LOG_PASS = "helloworld";
$DB_LOG_NAME = "dbms_log";
$DB_LOG_PORT = 33306;
$mysqli_log = new mysqli($DB_LOG_HOST, $DB_LOG_USER, $DB_LOG_PASS, $DB_LOG_NAME, $DB_LOG_PORT);

function writeLog(&$my,$is_error, $log_str) {
  	$log_sql="INSERT INTO log (logtime, is_error, detail) VALUES (CURRENT_TIMESTAMP,".$is_error.",'".mysqli_real_escape_string($my, $log_str)."')";
	$result=$my->query($log_sql) or die ($my->error.__LINE__);
}
?>
