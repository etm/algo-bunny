<?php
  $filter = "/[^a-zA-Z0-9_?! -]/";
  $uid = preg_replace($filter,'',$_COOKIE['userid']);
  $uname = preg_replace($filter,'',$_COOKIE['username']);
  if (!$uname || $uname == '') {
    $uname = "John Doe";
    $uid = "John Doe";
    file_put_contents('data/' . $uid . '/' . 'username.txt', $uname);
  }
  $cdate = date('y-m-d');
  $ctime = date('h-i-s');
  mkdir('data/' . $uid . '/' . $cdate,0755,true);

  $level = preg_replace($filter,'',$_REQUEST['level']);
  $data = $_REQUEST['solution'];

  file_put_contents('data/' . $uid . '/' . $cdate . '/' . $level . '_' . $ctime . '.json', $data);
  exit;
?>
