<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Config;

class OrdenPagoController extends Controller
{
    /**
     * Mostrar datos de una orden de pago por UUID
     */
    public function show(string $uuid)
    {
        try {
            $ordenPago = DB::table('ordenes_pago as op')
                ->join('orders as o', 'op.order_id', '=', 'o.id')
                ->join('customers as c', 'o.customer_id', '=', 'c.id')
                ->where('op.id', $uuid)
                ->where('op.status', 'pending')
                ->select(
                    'op.id as uuid',
                    'op.order_id',
                    'op.monto',
                    'op.monto_bs',
                    'op.status',
                    'c.phone as telefono_cliente',
                    'op.created_at'
                )
                ->first();

            if (!$ordenPago) {
                return response()->json([
                    'success' => false,
                    'message' => 'Orden de pago no encontrada o ya procesada'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'uuid' => $ordenPago->uuid,
                    'order_id' => $ordenPago->order_id,
                    'monto_usd' => (float) $ordenPago->monto,
                    'monto_bs' => (float) $ordenPago->monto_bs,
                    'telefono_cliente' => $ordenPago->telefono_cliente,
                    'status' => $ordenPago->status,
                    'cedula_beneficiario' => Config::get('services.bdv.cedula_beneficiario', 'J500092873'),
                    'telefono_beneficiario' => Config::get('services.bdv.telefono_destino', '04243428436'),
                    'fecha_creacion' => $ordenPago->created_at
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al consultar la orden',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
