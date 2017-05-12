<?php
include('../logConfig.php');
include('../queryGen.php');

//clean GET params
foreach(array_keys($_GET) as $key)
{
	$param[$key] = mysqli_real_escape_string($mysqli_log, $_GET[$key]);
}

//query condition
{
	$select =  'logtime, is_error, detail';
	$from = 'log';
	$cond = ' WHERE true';
	addCondDate($cond, $param, 'logtime', 'logtime_begins', 'logtime_ends', 'logtime');
	addCondBool($cond, $param,  'is_error', 'is_error');
	addCondLike($cond, $param, 'detail_like', 'detail_unlike', 'detail');
}

//sort condition
$sort = "";
if (isset($param['sort'])) {
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
$result=$mysqli_log->query($count_sql) or die ($mysqli_log->error.__LINE__);

$count = $result->fetch_assoc()['count(*)'];

//get
$sql="SELECT ".$select." FROM ".$from.$cond.$sort.$limit;
$result=$mysqli_log->query($sql) or die ($mysqli_log->error.__LINE__);

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
# JSON-encode the response
$json_response = json_encode($data);

// # Return the response
echo $json_response;
?>