<?php
  $filter = "/[^a-zA-Z0-9_?! -]/";
  $uname = preg_replace($filter,'',$_COOKIE['username']);
  if (!$uname || $uname == '') {
    $uname = "John Doe";
  }
  $cdate = date('y-m-d');
  $ctime = date('h-i-s');
  mkdir('scores/' . $uname . '/' . $cdate,0755,true);

  $level = preg_replace($filter,'',$_REQUEST['level']);
  $stats = $_REQUEST['stats'];
  $solution = $_REQUEST['solution'];

  file_put_contents('scores/' . $uname . '/' . $cdate . '/' . $level . '_' . $ctime . '.json', $stats);
  // Duplicate solution file for easy lookup (same name as the score file)
  file_put_contents('data/' . $uname . '/' . $cdate . '/' . $level . '_' . $ctime . '.json', $solution);
  exit;
?>
