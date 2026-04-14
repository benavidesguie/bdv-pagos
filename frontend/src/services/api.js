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

export default api
