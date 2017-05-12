<?php
include('../config.php');
include('../logConfig.php');

//clean POST params
foreach(array_keys($_POST) as $key)
{
	$param[$key] = mysqli_real_escape_string($mysqli, $_POST[$key]);
}

//notice: has 2nd delete below
//condition - MODIFY HERE ONLY
{
	$from = 'store_manager';
	$cond = ' WHERE sid = '.$param['sid'];
}

$sql='DELETE FROM '.$from.$cond;

//Log before execution
writeLog($mysqli_log, '0', 'Executing: '.$sql);


$result=$mysqli->query($sql);
//Log when error occurs
if($mysqli->error){
	$err = $mysqli->error.__LINE__;
	writeLog($mysqli_log, '1', $err);
	if(strripos($err,"foreign key constraint fails") != false){
		//foreign key constraint error
		echo '{"error":"2"}';
		exit;
	}else{
		//other error
		echo '{"error":"1"}';
		exit;
	}
}

//2nd delete
//condition - MODIFY HERE ONLY
{
	$from = 'store';
	$cond = ' WHERE sid = '.$param['sid'];
}

$sql='DELETE FROM '.$from.$cond;

//Log before execution
writeLog($mysqli_log, '0', 'Executing: '.$sql);


$result=$mysqli->query($sql);
//Log when error occurs
if($mysqli->error){
	$err = $mysqli->error.__LINE__;
	writeLog($mysqli_log, '1', $err);
	if(strripos($err,"foreign key constraint fails") != false){
		//foreign key constraint error
		echo '{"error":"2"}';
		exit;
	}else{
		//other error
		echo '{"error":"1"}';
		exit;
	}
}


?>