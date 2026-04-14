# BDV Pagos - Sistema de Conciliación Bancaria

Sistema de pagos con validación contra la API de BDV (Banco de Venezuela) para conciliación bancaria en tiempo real.

## Arquitectura

```
bdv-pagos/
├── backend/          # Laravel API
├── frontend/         # React (Vite)
└── docker-compose.yml
```

## Requisitos

- PHP 8.1+
- Composer
- Node.js 18+
- PostgreSQL 14+

## Instalación

### 1. Backend Laravel

```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
php artisan serve
```

### 2. Frontend React

```bash
cd frontend
npm install
npm run dev
```

### 3. Docker (alternativo)

```bash
docker-compose up -d
```

## Variables de Entorno

### Backend (.env)

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=marketplace
DB_USERNAME=user
DB_PASSWORD=pass

N8N_WEBHOOK_URL=https://danube.services:8443/webhook/webhook-conciliacion
BDV_API_KEY=600C705C85E1E28738F074174BA24E1F
BDV_TELEFONO_DESTINO=04243428436
BDV_CEDULA_BENEFICIARIO=J500092873
```

## API Endpoints

### GET /api/ordenes-pago/{uuid}
Consultar datos de una orden de pago.

**Response:**
```json
{
  "success": true,
  "data": {
    "uuid": "abc-123",
    "order_id": 18,
    "monto_usd": 0.68,
    "monto_bs": 286.29,
    "cedula_beneficiario": "J500092873",
    "telefono_beneficiario": "04243428436"
  }
}
```

### POST /api/webhook-conciliacion
Confirmar pago y notificar a n8n.

**Body:**
```json
{
  "orden_pago_uuid": "abc-123",
  "cedulaPagador": "V-12345678",
  "telefonoPagador": "04121234567",
  "referencia": "123456789012",
  "fechaPago": "2026-04-08",
  "importe": "120.00",
  "bancoOrigen": "0102"
}
```

## Flujo

1. Cliente hace pedido por WhatsApp
2. Orchestrator crea orden en PostgreSQL
3. Sistema crea registro en `ordenes_pago`
4. Cliente recibe link: `danube.services/pagos?id={uuid}`
5. Cliente completa formulario de pago móvil
6. Frontend valida contra API BDV
7. Si es exitoso → Backend notifica a n8n
8. n8n actualiza orden a `paid`
9. Cliente recibe confirmación por WhatsApp

## Bancos Soportados

El sistema incluye 27 bancos venezolanos con sus códigos BDV.

## License

MIT
