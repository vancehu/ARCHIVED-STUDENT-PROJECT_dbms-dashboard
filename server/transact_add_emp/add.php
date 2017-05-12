<?php
include('../config.php');
include('../logConfig.php');
include('../queryGen.php');
session_start();

//clear POST params
foreach(array_keys($_POST) as $key)
{
  $param[$key] = mysqli_real_escape_string($mysqli, $_POST[$key]);
}

//query condition - MODIFY HERE ONLY
{
	$from = 'transact_add';
	//pre-write auto generated cols here
	$cols = "order_id, order_time, eid,";
	$values = "NULL, CURRENT_TIMESTAMP, '".$_SESSION['user']['info']['eid']."',";
	addInsert($cols, $values, $param, 'quantity');
	addInsert($cols, $values, $param, 'pid');
	$cols = substr($cols, 0, -1); //remove last ',''
	$values = substr($values, 0, -1); //remove last ',''
}

/*$check_sql = "SELECT inventory_quantity FROM product WHERE pid='".$param['pid']."'";
$result=$mysqli->query($check_sql);

//when error occurs
		if($mysqli->error){
			writeLog($mysqli_log, '1', $mysqli->error.__LINE__);
			echo '{"error":"1"}';
			exit;
		}

		$check = array();
		if($result->num_rows > 0) {
			while($row = $result->fetch_assoc()) {
				$check[] = $row;	
			}
		}*/


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
$add_sql = "UPDATE product SET inventory_quantity = inventory_quantity+".$param['quantity']." WHERE pid='".$param['pid']."'";

//Log before execution
writeLog($mysqli_log, '0', 'Executing: '.$add_sql);

$result=$mysqli->query($add_sql);
//when error occurs
if($mysqli->error){
	writeLog($mysqli_log, '1', $mysqli->error.__LINE__);
	echo '{"error":"1"}';
	exit;
}

?>