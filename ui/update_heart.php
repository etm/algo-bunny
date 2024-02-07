<?php
//   $request = json_decode($_REQUEST, true)
  $filename = $_REQUEST['file'];
  $heart = json_decode($_REQUEST['json_data'], true)['heart'];

  $jsonData = file_get_contents($filename);
  $data = json_decode($jsonData, true);
  $data["heart"] = $heart;
  $newJsonData= json_encode($data);

  file_put_contents($filename, $newJsonData);
  exit;
?>