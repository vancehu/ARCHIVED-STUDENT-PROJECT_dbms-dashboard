<?php
include('../config.php');
include('../logConfig.php');
session_start();

//clean GET params
foreach(array_keys($_POST) as $key)
{
	$param[$key] = mysqli_real_escape_string($mysqli, $_POST[$key]);
}
if($param['pwd'] == 'test'){
	$_SESSION['user'] =  array('type' => 'admin');
	$status = array('type' => 'success', 'msg' => 'Login successfully');
	$data = array('status' => $status);
	$json_response = json_encode($data);
	echo $json_response;
}else{
	$status = array('type' => 'danger', 'msg' => 'Invalid user ID or password');
	$data = array('status' => $status);
	$json_response = json_encode($data);
	echo $json_response;
}

$_SESSION['timeout'] = time();
?>