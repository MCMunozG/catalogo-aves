<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determina si la aplicación está en modo de mantenimiento...
if (file_exists($maintenance = __DIR__ . '/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Registra el autocargador de Composer...
require __DIR__ . '/../vendor/autoload.php';

// Inicia Laravel y procesa la petición...
/** @var Application $app */
$app = require_once __DIR__ . '/../bootstrap/app.php';

$app->handleRequest(Request::capture());
