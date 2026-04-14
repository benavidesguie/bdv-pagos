# BDV Pagos - Sistema de Conciliación Bancaria

Sistema de pagos con validación contra la API de BDV (Banco de Venezuela) para conciliación bancaria en tiempo real.

## Estado del Proyecto

**DESARROLLO EN PROGRESO** - Fase 2: Conciliación Bancaria

---

## Arquitectura

```
bdv-pagos/
├── backend/                    # Node.js API (mock-server para desarrollo)
├── frontend/                   # React (Vite)
├── n8n-workflow-*.json        # Workflow de n8n
├── mock-server.mjs            # Servidor API de prueba
└── docker-compose.yml
```

## Estado de Componentes

| Componente | Estado | Descripción |
|------------|--------|-------------|
| Frontend React | ✅ Completado | Página de pagos con formulario |
| Backend (mock-server) | ✅ Completado | API que conecta con n8n |
| Workflow n8n | ✅ Creado | Esperando pruebas |
| Subworkflow DB | ⏳ Pendiente | Crear orden_pago al cerrar orden |
| Base de datos | ✅ Creada | Tabla ordenes_pago existe |

---

## Flujo Completo

```
1. Cliente → WhatsApp → Agente IA
2. Agente IA → create_order → Subworkflow DB
3. Subworkflow DB → crea orden + ordenes_pago
4. Agente IA → envía link: danube.services/pagos?id={uuid}
5. Cliente → abre página de pagos
6. Página → GET /api/ordenes-pago/{uuid} → muestra datos
7. Cliente → llena formulario (cédula, tel, ref, banco)
8. Cliente → clic "Validar Pago"
9. Frontend → POST /api/webhook-conciliacion → Backend
10. Backend → POST n8n webhook → https://danube.services:8443/webhook/webhook-conciliacion
11. n8n Workflow:
    a. Get Orden Pago + Order Items
    b. Validate BDV API
    c. Check BDV Response (code === 1000?)
    d. Generate Receipt Image (@napi-rs/canvas)
    e. Send WhatsApp (Evolution API)
    f. Update orden_pago status = 'paid'
    g. Update orders status = 'paid'
    h. Respond to webhook
12. Backend → retorna { success: true, code: 1000 } → Frontend
13. Frontend → muestra "Pago Confirmado" → cierra ventana (4 seg)
14. Cliente → recibe WhatsApp con comprobante
```

---

## Variables de Entorno

### Backend (.env)

```env
DB_CONNECTION=pgsql
DB_HOST=danube.services
DB_PORT=5434
DB_DATABASE=whatsapp-venta
DB_USERNAME=n8n_user
DB_PASSWORD=Danube.01

N8N_WEBHOOK_URL=https://danube.services:8443/webhook/webhook-conciliacion
BDV_API_URL=https://bdvconciliacion.banvenez.com:443/getMovement
BDV_API_KEY=600C705C85E1E28738F074174BA24E1F
BDV_TELEFONO_DESTINO=04243428436
BDV_CEDULA_BENEFICIARIO=J500092873
```

---

## API Endpoints

### GET /api/ordenes-pago/{uuid}
Consultar datos de una orden de pago.

**Response:**
```json
{
  "success": true,
  "data": {
    "uuid": "f9009b92-4276-4720-8784-effa2f626c23",
    "order_id": 21,
    "monto_usd": 0.6,
    "monto_bs": 286.29,
    "telefono_cliente": "584243428436",
    "status": "pending",
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
  "orden_pago_uuid": "f9009b92-4276-4720-8784-effa2f626c23",
  "cedulaPagador": "V-12345678",
  "telefonoPagador": "04243428436",
  "referencia": "123456789012",
  "fechaPago": "2026-04-14",
  "importe": "0.6",
  "bancoOrigen": "0102"
}
```

**Response:**
```json
{
  "success": true,
  "code": 1000,
  "message": "Pago confirmado y notificación enviada"
}
```

---

## Workflow n8n

**ID:** `hgtaaxVXbqK12uDM`

**Archivo:** `n8n-workflow-webhook-conciliacion.json`

**Nodos:**
1. Webhook (`/webhook-conciliacion`)
2. Get Orden Pago (PostgreSQL)
3. Get Order Items (PostgreSQL)
4. Validate BDV Payment (HTTP Request)
5. Check BDV Response (Code)
6. Generate Receipt Image (@napi-rs/canvas)
7. Send Text Message (Evolution API)
8. Update Orden Pago (PostgreSQL)
9. Update Order Status (PostgreSQL)
10. Respond to Webhook

**Dependencias n8n:**
- `@napi-rs/canvas` - Para generar imágenes PNG
- Credenciales PostgreSQL: `c2VTi6tZW3CQZBTg`
- Credenciales Evolution API: `E99psqFn5CDu92sA`

---

## Frontend - Características

### Formulario de Pago
- ✅ Selector V/J/E para cédula
- ✅ Teléfono precargado (transformado de BD: 58XXXXXXXXXX → 0XXXXXXXXXX)
- ✅ Filtro de bancos integrado (búsqueda por código o nombre)
- ✅ Validación de campos requeridos
- ✅ Cierre automático de ventana al confirmar (4 segundos)

### Componentes
- `App.jsx` - Router y carga de datos
- `PagoPage.jsx` - Página principal
- `PaymentForm.jsx` - Formulario de pago
- `OrderInfo.jsx` - Datos de la orden
- `BankSelect.jsx` - Selector de banco con búsqueda

---

## Instalación Desarrollo Local

### 1. Backend API (mock-server)

```bash
cd /Users/benavidesguide/Documents/codigo/bdv-pagos
node mock-server.mjs
# Servidor en http://localhost:8000
```

### 2. Frontend React

```bash
cd frontend
npm install
npm run dev
# Frontend en http://localhost:3000
```

### 3. Probar flujo

```
http://localhost:3000/?id=f9009b92-4276-4720-8784-effa2f626c23
```

---

## Pendiente para Producción

1. ⏳ **Subworkflow DB** - Modificar para crear registro en `ordenes_pago` al cerrar orden
2. ⏳ **Deploy Backend Laravel** - En servidor danube.services
3. ⏳ **Deploy Frontend React** - Build y deploy
4. ⏳ **Probar flujo completo end-to-end**
5. ⏳ **Validar imagen PNG** - Verificar que @napi-rs/canvas funciona en n8n

---

## Bancos Soportados

El sistema incluye 27 bancos venezolanos con sus códigos BDV (archivo `frontend/src/data/bancos.json`).

---

## License

MIT
