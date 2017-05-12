<?php
include('../config.php');
include('../logConfig.php');
include('../queryGen.php');

//clean GET params
foreach(array_keys($_GET) as $key)
{
	$param[$key] = mysqli_real_escape_string($mysqli, $_GET[$key]);
}

//query condition - MODIFY HERE ONLY
{
	$select =  'order_id, order_time, quantity, transact_add.pid, pname, transact_add.eid, ename';
	$from = 'transact_add, employee, product';
	$cond = ' WHERE transact_add.pid = product.pid AND transact_add.eid = employee.eid';
	addCondIs($cond, $param,  'order_id', 'order_id_not', 'order_id');
	addCondDate($cond, $param, 'order_time', 'order_time_begins', 'order_time_ends','order_time');
	addCondComp($cond, $param, 'quantity', 'quantity_low', 'quantity_high','quantity');
	addCondIs($cond, $param,  'pid', 'pid_not', 'transact_add.pid');
	addCondIs($cond, $param,  'eid', 'eid_not', 'transact_add.eid');
	
	
}

//sort condition
$sort = "";
if (isset($param['sort'])) {
	if($param['sort'] == "pid"){
		$param['sort'] = "transact_add.pid";
	}
	if($param['sort'] == "eid"){
		$param['sort'] = "transact_add.eid";
	}
	$sort .= " ORDER BY ".$param['sort'];
}
if (isset($param['sort']) && isset($param['order'])) {
	if($param['order'] == 0){
		$sort .= " ASC";
	}else{
		$sort .= " DESC";
	}
}

//page control
$limit = "";
if (isset($param['page'])) {
	$limit .= " LIMIT ".($param['page']*10-10).", 10";
}

//count
$count_sql = 'SELECT count(*) FROM '.$from.$cond.$sort;
$result=$mysqli->query($count_sql);

//when error occurs
if($mysqli->error){
	writeLog($mysqli_log, '1', $mysqli->error.__LINE__);
	echo '{"error":"1"}';
	exit;
}
$count = $result->fetch_assoc()['count(*)'];

//get
$sql="SELECT ".$select." FROM ".$from.$cond.$sort.$limit;
$result=$mysqli->query($sql);

//when error occurs
if($mysqli->error){
	writeLog($mysqli_log, '1', $mysqli->error.__LINE__);
	echo '{"error":"1"}';
	exit;
}

$records = array();
if($result->num_rows > 0) {
	while($row = $result->fetch_assoc()) {
		$records[] = $row;	
	}
}

if (isset($param['page'])){
	$data = array('records' => $records, 'page' => $param['page'], 'count' => $count);
} else {
	$data = array('records' => $records, 'count' => $count);
}

//JSON-encode the response
$json_response = json_encode($data);

//Return the response
echo $json_response;
?>