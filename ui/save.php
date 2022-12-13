<?php
  $filter = "/[^a-zA-Z0-9_?! -]/";
  $uname = preg_replace($filter,'',$_COOKIE['username']);
  if (!$uname || $uname == '') {
    $uname = "John Doe";
  }
  $cdate = date('y-m-d');
  $ctime = date('h-i-s');
  mkdir('data/' . $uname . '/' . $cdate,0755,true);

  $level = preg_replace($filter,'',$_REQUEST['level']);
  $data = $_REQUEST['solution'];

  file_put_contents('data/' . $uname . '/' . $cdate . '/' . $level . '_' . $ctime . '.json', $data);
  exit;
?>
