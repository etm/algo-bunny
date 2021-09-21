<?php
  header('Content-type: text/plain');
  if ($_REQUEST['url']) {
    echo file_get_contents($_REQUEST['url']);
  } else {
    echo "";
  }
  exit;
?>
