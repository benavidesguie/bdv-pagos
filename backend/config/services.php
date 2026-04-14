<?php

return [

    /*
    |--------------------------------------------------------------------------
    | BDV API Configuration
    |--------------------------------------------------------------------------
    */

    'bdv' => [
        'api_url' => env('BDV_API_URL', 'https://bdvconciliacion.banvenez.com:443/getMovement'),
        'api_key' => env('BDV_API_KEY', '600C705C85E1E28738F074174BA24E1F'),
        'telefono_destino' => env('BDV_TELEFONO_DESTINO', '04243428436'),
        'cedula_beneficiario' => env('BDV_CEDULA_BENEFICIARIO', 'J500092873'),
    ],

    /*
    |--------------------------------------------------------------------------
    | N8N Configuration
    |--------------------------------------------------------------------------
    */

    'n8n' => [
        'webhook_url' => env('N8N_WEBHOOK_URL', 'https://danube.services:8443/webhook/webhook-conciliacion'),
    ],

];
