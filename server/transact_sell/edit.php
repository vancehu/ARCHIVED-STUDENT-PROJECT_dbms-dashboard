<?php
include('../config.php');
include('../logConfig.php');
include('../queryGen.php');

//clean POST params
foreach(array_keys($_POST) as $key)
{
  $param[$key] = mysqli_real_escape_string($mysqli, $_POST[$key]);
}

//query condition - MODIFY HERE ONLY
{
	$from = 'transact_sell';
	$update = "";
	$cond = ' WHERE order_id = '.$param['order_id'];
	addUpdate($update, $param, 'quantity');
	addUpdate($update, $param, 'cid');
	addUpdate($update, $param, 'pid');
	addUpdate($update, $param, 'eid');
	
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