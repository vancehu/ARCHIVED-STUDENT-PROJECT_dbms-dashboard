<?php
session_start();
if ($_SESSION['timeout'] + 600< time()) {
	if (isset($_SESSION['user'])){
		$status = array('type' => 'danger', 'msg' => 'Your login information has expired. Please try it again.');
		$data = array('status' => $status);
		$json_response = json_encode($data);
		echo $json_response;
	}
	unset($_SESSION['user']);
} 
if (isset($_SESSION['user'])){
	echo json_encode($_SESSION['user']);
}
$_SESSION['timeout'] = time();

?>