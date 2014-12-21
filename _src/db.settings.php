<?php

$databases['default']['default'] = array(
  'driver' => 'mysql',
    'database' => '<%= database.name %>',
    'username' => '<%= database.user %>',
    'password' => '<%= database.password %>',
    'host' => 'localhost',
    'prefix' => '',
);
