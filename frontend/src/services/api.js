import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

export const getOrdenPago = async (uuid) => {
  const response = await api.get(`/ordenes-pago/${uuid}`)
  return response.data
}

export const confirmarPago = async (data) => {
  const response = await api.post('/webhook-conciliacion', data)
  return response.data
}

export const BDV_API_CONFIG = {
  url: 'https://bdvconciliacion.banvenez.com:443/getMovement',
  headers: {
    'X-API-Key': '600C705C85E1E28738F074174BA24E1F',
    'Content-Type': 'application/json',
  }
}

export const validarPagoBDV = async (datosPago) => {
  const payload = {
    cedulaPagador: datosPago.cedulaPagador,
    telefonoPagador: datosPago.telefonoPagador,
    telefonoDestino: datosPago.telefonoDestino,
    referencia: datosPago.referencia,
    fechaPago: datosPago.fechaPago,
    importe: datosPago.importe,
    bancoOrigen: datosPago.bancoOrigen,
  }

  const response = await axios.post(BDV_API_CONFIG.url, payload, {
    headers: BDV_API_CONFIG.headers,
    timeout: 30000,
  })

  return response.data
}

export default api
