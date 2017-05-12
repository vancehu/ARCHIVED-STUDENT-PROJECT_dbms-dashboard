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
	$select =  'pid, pname, price, product.p_cid, p_cname, inventory_quantity';
	$from = 'product, product_category';
	$cond = ' WHERE product.p_cid = product_category.p_cid';
	addCondIs($cond, $param,  'pid', 'pid_not', 'pid');
	addCondLike($cond, $param, 'pname_like', 'pname_unlike', 'pname');
	addCondIs($cond, $param,  'p_cid', 'p_cid_not', 'product.p_cid');
	addCondComp($cond, $param, 'price', 'price_low', 'price_high','price');
	addCondComp($cond, $param, 'inventory_quantity', 'inventory_quantity_low', 'inventory_quantity_high','inventory_quantity');
}

//sort condition
	$sort = "";
	if (isset($param['sort'])) {
			if($param['sort'] == "p_cid"){
		$param['sort'] = "product.p_cid";
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