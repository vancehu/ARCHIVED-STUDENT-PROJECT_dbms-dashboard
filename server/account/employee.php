<?php
include('../config.php');
include('../logConfig.php');
session_start();

//clean GET params
foreach(array_keys($_GET) as $key)
{
	$param[$key] = mysqli_real_escape_string($mysqli, $_GET[$key]);
}
//clean POST params
foreach(array_keys($_POST) as $key)
{
	$param[$key] = mysqli_real_escape_string($mysqli, $_POST[$key]);
}
//query condition
{
	$select = '*';
	$from = 'employee';
	$cond = " WHERE eid='".$param['eid']."'";
}
//sort condition
$sort = "";

//page control
$limit = " LIMIT 1";


$count_sql = 'SELECT count(*) FROM '.$from.$cond.$sort;
$result=$mysqli->query($count_sql);
if($mysqli->error){
	$status = array('type' => 'danger', 'msg' => 'Unexpected error');
	$data = array('status' => $status);
	$json_response = json_encode($data);
	echo $json_response;
	exit;
}

$count = $result->fetch_assoc()['count(*)'];
if($count == '1' & $param['pwd'] == 'test'){
	$sql="SELECT ".$select." FROM ".$from.$cond.$sort.$limit;
	$result=$mysqli->query($sql);

	if($mysqli->error){
		$status = array('type' => 'danger', 'msg' => 'Unexpected error');
		$data = array('status' => $status);
		$json_response = json_encode($data);
		echo $json_response;
		exit;
	}
	$records = array();
	if($result->num_rows > 0) {
		while($row = $result->fetch_assoc()) {
			$records[] = $row;	
		}
	}
	$_SESSION['user'] =  array('type' => 'employee', 'info' => $records[0]);
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