<?php
include('../config.php');
include('../logConfig.php');

//clean POST params
foreach(array_keys($_POST) as $key)
{
	$param[$key] = mysqli_real_escape_string($mysqli, $_POST[$key]);
}

//condition - MODIFY HERE ONLY
{
	$from = 'product';
	$cond = ' WHERE pid = '.$param['pid'];
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