<?php 
$DB_HOST = $_ENV["DEMO_MYSQL_PORT_3306_TCP_ADDR"];
$DB_USER = "root";
$DB_PASS = "helloworld";
$DB_NAME = "dbms";
$DB_PORT = 33306;
$mysqli = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME, $DB_PORT);
?>
