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
	$select =  'eid, ename, salary, employee.jid, title, email, employee.zipcode, street, city, state, sid';
	$from = 'employee, job_title, zipcode';
	$cond = ' WHERE employee.jid = job_title.jid AND employee.zipcode = zipcode.zipcode';
	addCondIs($cond, $param,  'eid'	, 'eid_not', 'eid');
	addCondLike($cond, $param, 'ename_like', 'ename_unlike', 'ename');
	addCondComp($cond, $param, 'salary', 'salary_low', 'salary_high','salary');
	addCondIs($cond, $param,  'jid', 'jid_not', 'employee.jid');
	addCondIs($cond, $param,  'zipcode', 'zipcode_not', 'employee.zipcode');
	addCondLike($cond, $param, 'street_like', 'street_unlike', 'street');
	addCondIs($cond, $param,  'state', 'state_not', 'state');
	addCondIs($cond, $param,  'sid', 'sid_not', 'sid');
	
}

//sort condition
$sort = "";
if (isset($param['sort'])) {
	if($param['sort'] == "jid"){
		$param['sort'] = "employee.jid";
	}
	if($param['sort'] == "zipcode"){
		$param['sort'] = "employee.zipcode";
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