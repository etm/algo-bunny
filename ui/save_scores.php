<?php
  $filter = "/[^a-zA-Z0-9_?! -]/";
  $uid = preg_replace($filter,'',$_COOKIE['userid']);
  if (!$uid || $uid == '') {
    $uid = "John Doe";
  }
  $cdate = date('y-m-d');
  $ctime = date('h-i-s');
  mkdir('scores/' . $uid . '/' . $cdate,0755,true);

  $level = preg_replace($filter,'',$_REQUEST['level']);
  $stats = $_REQUEST['stats'];
  $solution = $_REQUEST['solution'];

  file_put_contents('scores/' . $uid . '/' . $cdate . '/' . $level . '_' . $ctime . '.json', $stats);
  // Duplicate solution file for easy lookup (same name as the score file)
  file_put_contents('data/' . $uid . '/' . $cdate . '/' . $level . '_' . $ctime . '.json', $solution);
  exit;
?>
