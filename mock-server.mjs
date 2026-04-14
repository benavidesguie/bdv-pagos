import http from 'http';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  host: 'danube.services',
  port: 5434,
  database: 'whatsapp-venta',
  user: 'n8n_user',
  password: 'Danube.01',
  max: 5,
  idleTimeoutMillis: 30000
});

const N8N_WEBHOOK_URL = 'https://danube.services:8443/webhook/webhook-conciliacion';

async function handleRequest(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  const url = req.url
  console.log(`${req.method} ${url}`)

  try {
    if (req.method === 'GET' && url.match(/^\/api\/ordenes-pago\/.+$/)) {
      const uuid = url.split('/')[3]

      const result = await pool.query(`
        SELECT
          op.id as uuid,
          op.order_id,
          op.monto,
          op.monto_bs,
          op.status,
          c.phone as telefono_cliente,
          op.created_at
        FROM marketplace.ordenes_pago op
        JOIN marketplace.orders o ON op.order_id = o.id
        JOIN marketplace.customers c ON o.customer_id = c.id
        WHERE op.id = $1
      `, [uuid])

      if (result.rows.length === 0) {
        res.writeHead(404, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({
          success: false,
          message: 'Orden de pago no encontrada o ya procesada'
        }))
      } else {
        const orden = result.rows[0]
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({
          success: true,
          data: {
            uuid: orden.uuid,
            order_id: orden.order_id,
            monto_usd: parseFloat(orden.monto),
            monto_bs: parseFloat(orden.monto_bs),
            telefono_cliente: orden.telefono_cliente,
            status: orden.status,
            cedula_beneficiario: 'J500092873',
            telefono_beneficiario: '04243428436',
            fecha_creacion: orden.created_at
          }
        }))
      }
      return
    }

    if (req.method === 'POST' && url === '/api/webhook-conciliacion') {
      let body = ''
      req.on('data', chunk => { body += chunk })
      req.on('end', async () => {
        const data = JSON.parse(body)
        console.log('Webhook received:', data)

        try {
          console.log('Llamando a n8n:', N8N_WEBHOOK_URL)

          const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              orden_pago_uuid: data.orden_pago_uuid,
              cedulaPagador: data.cedulaPagador,
              telefonoPagador: data.telefonoPagador,
              referencia: data.referencia,
              fechaPago: data.fechaPago,
              importe: data.importe,
              bancoOrigen: data.bancoOrigen,
              telefonoDestino: '04243428436'
            })
          })

          const n8nResult = await n8nResponse.json()
          console.log('n8n response:', n8nResult)

          if (n8nResponse.ok) {
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({
              success: true,
              message: 'Pago confirmado y sincronizado',
              code: 1000
            }))
          } else {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({
              success: false,
              message: n8nResult.message || 'Error en n8n'
            }))
          }
        } catch (error) {
          console.error('Error calling n8n:', error)
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({
            success: false,
            message: 'Error de conexión con n8n: ' + error.message
          }))
        }
      })
      return
    }

    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Not found' }))

  } catch (error) {
    console.error('Error:', error.message)
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: error.message }))
  }
}

const PORT = 8000;

const httpServer = http.createServer(handleRequest);

httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║          API Server - BDV Pagos                          ║
╠═══════════════════════════════════════════════════════════╣
║  Server running at http://localhost:${PORT}                  ║
║                                                           ║
║  Endpoints:                                               ║
║  GET  /api/ordenes-pago/{uuid} - Get order from DB      ║
║  POST /api/webhook-conciliacion   - Forward to n8n       ║
║                                                           ║
║  n8n webhook: ${N8N_WEBHOOK_URL}   ║
╚═══════════════════════════════════════════════════════════╝
  `)
});
