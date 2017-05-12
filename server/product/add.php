<?php
include('../config.php');
include('../logConfig.php');
include('../queryGen.php');

//clear POST params
foreach(array_keys($_POST) as $key)
{
  $param[$key] = mysqli_real_escape_string($mysqli, $_POST[$key]);
}

//query condition - MODIFY HERE ONLY
{
	$from = 'product';
	//pre-write auto generated cols here
	$cols = "pid,";
	$values = "NULL,";
	addInsert($cols, $values, $param, 'pname');
	addInsert($cols, $values, $param, 'price');
	addInsert($cols, $values, $param, 'p_cid');
	$cols .= 'inventory_quantity,';
	$values .= '0,';
	$cols = substr($cols, 0, -1); //remove last ',''
	$values = substr($values, 0, -1); //remove last ',''
}

$sql="INSERT INTO ".$from." (".$cols.") VALUES (".$values.")";
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