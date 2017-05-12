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
	$cond = 'SELECT transact_sell.pid, pname, sum(quantity) AS total, round(avg(quantity)) AS avg, min(quantity) AS min, max(quantity) AS max, price, sum(quantity)*price AS total_price FROM transact_sell, product WHERE transact_sell.pid = product.pid GROUP BY transact_sell.pid HAVING true';
	addCondIs($cond, $param,  'pid', 'pid_not', 'transact_sell.pid');
	addCondLike($cond, $param, 'pname_like', 'pname_unlike','pname');
	addCondComp($cond, $param, 'total', 'total_low', 'total_high','total');
	addCondComp($cond, $param, 'avg', 'avg_low', 'avg_high','avg');
	addCondComp($cond, $param, 'min', 'min_low', 'min_high','min');
	addCondComp($cond, $param, 'max', 'max_low', 'max_high','max');
	addCondComp($cond, $param, 'price', 'price_low', 'price_high','price');
	addCondComp($cond, $param, 'total_price', 'total_price_low', 'total_price_high','total_price');	
}

//sort condition
$sort = "";
if (isset($param['sort'])) {
	if($param['sort'] == "pid"){
		$param['sort'] = "transact_sell.pid";
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
$count_sql = 'SELECT count(*) FROM ('.$cond.$sort.') AS TEMP';
$result=$mysqli->query($count_sql);

//when error occurs
if($mysqli->error){
	writeLog($mysqli_log, '1', $mysqli->error.__LINE__);
	echo '{"error":"1"}';
	exit;
}
$count = $result->fetch_assoc()['count(*)'];


//get
$sql=$cond.$sort.$limit;
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