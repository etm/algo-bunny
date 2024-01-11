<?php
  $filter = "/[^a-zA-Z0-9_?! -]/";
  $uid = preg_replace($filter,'',$_COOKIE['userid']);
  $uname = preg_replace($filter,'',$_COOKIE['username']);
  if (!$uname || $uname == '') {
    $uname = "John Doe";
    $uid = "John Doe";    
  }

  file_put_contents('data/' . $uid . '/' . 'username.txt', $uname);
  exit;
?>
