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
	$select =  'store.sid, store.zipcode, store.street, city, state, store.rid, rname, store_manager.eid, ename';
	$from = 'store, store_manager, zipcode, employee, region';
	$cond = ' WHERE store.sid = store_manager.sid AND store_manager.eid = employee.eid AND store.zipcode = zipcode.zipcode AND store.rid=region.rid';
	addCondIs($cond, $param,  'sid', 'sid_not', 'store.sid');
	addCondIs($cond, $param,  'zipcode', 'zipcode_not', 'store.zipcode');
	addCondLike($cond, $param, 'street_like', 'street_unlike', 'store.street');
	addCondIs($cond, $param,  'state', 'state_not', 'state');
	addCondIs($cond, $param,  'rid', 'rid_not', 'store.rid');
	addCondIs($cond, $param,  'eid', 'eid_not', 'store.eid');
}

//sort condition
$sort = "";
if (isset($param['sort'])) {
	if($param['sort'] == "zipcode"){
		$param['sort'] = "zipcode.zipcode";
	}
	if($param['sort'] == "sid"){
		$param['sort'] = "store.sid";
	}
	if($param['sort'] == "street"){
		$param['sort'] = "store.street";
	}
	if($param['sort'] == "eid"){
		$param['sort'] = "store_manager.sid";
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