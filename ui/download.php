<?php
  header('Content-type: application/json');
  if ($_REQUEST['url']) {
    echo file_get_contents($_REQUEST['url']);
  } else {
    echo "[]";
  }
  exit;
?>
