<?php
session_start();
unset($_SESSION['user']);
$status = array('type' => 'success', 'msg' => 'Logout successfully');
$data = array('status' => $status);
$json_response = json_encode($data);
echo $json_response;
$_SESSION['timeout'] = time();
?>