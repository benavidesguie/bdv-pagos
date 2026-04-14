<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrdenPago extends Model
{
    protected $table = 'ordenes_pago';
    
    protected $fillable = [
        'id',
        'order_id',
        'telefono',
        'monto',
        'monto_bs',
        'status',
        'bdv_response',
    ];

    protected $casts = [
        'bdv_response' => 'array',
        'monto' => 'decimal:2',
        'monto_bs' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'order.customer_id');
    }
}
