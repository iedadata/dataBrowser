<?php
$data = array('wkt'=>$_GET['wkt']);
echo file_get_contents("http://www.usap-dc.org/polygon?".http_build_query($data));
?>
