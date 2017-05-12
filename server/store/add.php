<?php
include('../config.php');
include('../logConfig.php');
include('../queryGen.php');

//clear POST params
foreach(array_keys($_POST) as $key)
{
  $param[$key] = mysqli_real_escape_string($mysqli, $_POST[$key]);
}

//notice: has 2nd insertion below
//query condition - MODIFY HERE ONLY
{
	$from = 'store';
	//pre-write auto generated cols here
	$cols = "sid,";
	$values = "NULL,";
	addInsert($cols, $values, $param, 'rid');
	addInsert($cols, $values, $param, 'zipcode');
	addInsert($cols, $values, $param, 'street');
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

//2nd insertion
//query condition - MODIFY HERE ONLY
{
	$from = 'store_manager';
	//pre-write auto generated cols here
	$cols = "sid,";
	$values = "LAST_INSERT_ID(),";
	addInsert($cols, $values, $param, 'eid');
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