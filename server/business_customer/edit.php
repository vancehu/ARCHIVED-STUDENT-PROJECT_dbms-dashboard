<?php
include('../config.php');
include('../logConfig.php');
include('../queryGen.php');

//clean POST params
foreach(array_keys($_POST) as $key)
{
  $param[$key] = mysqli_real_escape_string($mysqli, $_POST[$key]);
}

//notice: has 2nd update below
//query condition - MODIFY HERE ONLY
{
	$from = 'customer';
	$update = "";
	$cond = ' WHERE cid = '.$param['cid'];
	addUpdate($update, $param, 'cname');
	addUpdate($update, $param, 'zipcode');
	addUpdate($update, $param, 'street');

	$update = substr($update, 0, -1); //remove last ',''
}


$sql="UPDATE ".$from." SET".$update.$cond;
//Log before execution
writeLog($mysqli_log, '0', 'Executing: '.$sql);



$result=$mysqli->query($sql);
//when error occurs
if($mysqli->error){
	writeLog($mysqli_log, '1', $mysqli->error.__LINE__);
	echo '{"error":"1"}';
	exit;
}

//2nd update
//query condition - MODIFY HERE ONLY
{
	$from = 'business_customer';
	$update = "";
	$cond = ' WHERE cid = '.$param['cid'];
	addUpdate($update, $param, 'annual_income');
	addUpdate($update, $param, 'b_cid');

	$update = substr($update, 0, -1); //remove last ',''
}


$sql="UPDATE ".$from." SET".$update.$cond;
//Log before execution
writeLog($mysqli_log, '0', 'Executing: '.$sql);



$result=$mysqli->query($sql);
//when error occurs
if($mysqli->error){
	writeLog($mysqli_log, '1', $mysqli->error.__LINE__);
	echo '{"error":"1"}';
	exit;
}

?>