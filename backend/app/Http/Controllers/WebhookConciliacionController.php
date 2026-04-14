<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;

class WebhookConciliacionController extends Controller
{
    /**
     * Recibir confirmación de pago y notificar a n8n
     */
    public function handle(Request $request)
    {
        // Validar datos de entrada
        $validated = $request->validate([
            'orden_pago_uuid' => 'required|uuid',
            'cedulaPagador' => 'required|string|max:20',
            'telefonoPagador' => 'required|string|max:20',
            'referencia' => 'required|string|max:50',
            'fechaPago' => 'required|date',
            'importe' => 'required|numeric|min:0',
            'bancoOrigen' => 'required|string|max:10'
        ]);

        // Buscar la orden de pago
        $ordenPago = DB::table('ordenes_pago')
            ->where('id', $validated['orden_pago_uuid'])
            ->where('status', 'pending')
            ->first();

        if (!$ordenPago) {
            return response()->json([
                'success' => false,
                'message' => 'Orden de pago no encontrada o ya procesada'
            ], 404);
        }

        // Preparar payload para n8n
        $n8nPayload = [
            'orden_pago_uuid' => $validated['orden_pago_uuid'],
            'order_id' => $ordenPago->order_id,
            'cedulaPagador' => $validated['cedulaPagador'],
            'telefonoPagador' => $validated['telefonoPagador'],
            'telefonoDestino' => Config::get('services.bdv.telefono_destino', '04243428436'),
            'referencia' => $validated['referencia'],
            'fechaPago' => $validated['fechaPago'],
            'importe' => (float) $validated['importe'],
            'bancoOrigen' => $validated['bancoOrigen'],
            'monto_bs' => (float) $ordenPago->monto_bs
        ];

        // Llamar al webhook de n8n
        try {
            $n8nWebhookUrl = Config::get('services.bdv.n8n_webhook_url');
            
            $response = Http::timeout(30)
                ->withHeaders([
                    'Content-Type' => 'application/json'
                ])
                ->post($n8nWebhookUrl, $n8nPayload);

            Log::info('Webhook n8n response', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            if ($response->successful()) {
                // Actualizar orden de pago a 'paid'
                DB::table('ordenes_pago')
                    ->where('id', $validated['orden_pago_uuid'])
                    ->update([
                        'status' => 'paid',
                        'bdv_response' => json_encode([
                            'confirmed_at' => now()->toIso8601String(),
                            'n8n_response' => $response->json()
                        ]),
                        'updated_at' => now()
                    ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Pago confirmado y sincronizado',
                    'code' => 1000
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Error al procesar en n8n',
                    'code' => $response->status()
                ], 500);
            }

        } catch (\Exception $e) {
            Log::error('Error al llamar webhook n8n', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error de conexión con el servicio de conciliación',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
