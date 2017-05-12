<?php
//generate update query
function addUpdate(&$str, &$param, $colname){
	if (isset($param[$colname])) {
		$str .= " ".$colname."= '".$param[$colname]."',";
	}
}

//generate insert query
function addInsert(&$str1, &$str2, &$param, $colname){
	if (isset($param[$colname])) {
		$str1 .= $colname.",";
		$str2 .= "'".$param[$colname]."',";
	}
}
//is-is not conditon
function addCondIs(&$str, &$param, $kw1, $kw2, $colname){
	if (isset($param[$kw1])) {
		$str .= " AND ".$colname."='".$param[$kw1]."'";
	}
	if (isset($param[$kw2])) {
		$str .= " AND ".$colname."<>'".$param[$kw2]."'";
	}
}

//like-unlike condition
function addCondLike(&$str, &$param, $kw1, $kw2, $colname){
	if (isset($param[$kw1])) {
		$str .= " AND ".$colname." LIKE '%".$param[$kw1]."%'";
	}
	if (isset($param[$kw2])) {
		$str .= " AND ".$colname." NOT LIKE '%".$param[$kw2]."%'";
	}
}

//compare condition
function addCondComp(&$str, &$param, $kw1, $kw2, $kw3, $colname){
	if (isset($param[$kw1])) {
		$str .= " AND ".$colname."='".$param[$kw1]."'";
	}
	if (isset($param[$kw2])) {
		$str .= " AND ".$colname.">='".$param[$kw2]."'";
	}
	if (isset($param[$kw3])) {
		$str .= " AND ".$colname."<='".$param[$kw3]."'";
	}
}

//date compare condition
function addCondDate(&$str, &$param, $kw1, $kw2, $kw3, $colname){
	if (isset($param[$kw1])) {
		$str .= " AND ".$colname." >= '".$param[$kw1]." 00:00:00' AND ".$colname." <= '".$param[$kw1]." 23:59:59'";
	}
	if (isset($param[$kw2])) {
		$str .= " AND ".$colname." >= '".$param[$kw2]." 00:00:00'";
	}
	if (isset($param[$kw3])) {
		$str .= " AND ".$colname." <= '".$param[$kw3]." 23:59:59'";
	}
}

//bool condition
function addCondBool(&$str, &$param, $kw, $colname){
	if (isset($param[$kw])) {
		$str .= " AND ".$colname."=".$param[$kw];
	}
}
?>