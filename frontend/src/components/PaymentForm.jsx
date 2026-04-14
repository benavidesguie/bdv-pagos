import { useState, useEffect } from 'react'
import BankSelect from './BankSelect'

function formatearTelefono(telefono) {
  if (!telefono) return ''
  // Si ya tiene 11 dígitos, no transformar
  if (telefono.length === 11) {
    return telefono
  }
  // Si tiene 12 dígitos: "58XXXXXXXXXX" → "04XXXXXXXXX"
  if (telefono.length === 12) {
    return "0" + telefono.slice(2)
  }
  // Otros casos: devolver como está
  return telefono
}

function PaymentForm({ onSubmit, telefonoInicial = '' }) {
  const telefonoFormateado = formatearTelefono(telefonoInicial)

  const [formData, setFormData] = useState({
    cedulaTipo: 'V',
    cedulaNumero: '',
    telefonoPagador: telefonoFormateado,
    referencia: '',
    fechaPago: new Date().toISOString().split('T')[0],
    bancoOrigen: '',
  })

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      telefonoPagador: telefonoFormateado
    }))
  }, [telefonoInicial])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const cedulaCompleta = `${formData.cedulaTipo}-${formData.cedulaNumero}`
    onSubmit({
      ...formData,
      cedulaPagador: cedulaCompleta
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Cédula del Pagador</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select
            name="cedulaTipo"
            value={formData.cedulaTipo}
            onChange={handleChange}
            style={{ width: '70px' }}
          >
            <option value="V">V</option>
            <option value="J">J</option>
            <option value="E">E</option>
          </select>
          <input
            type="text"
            name="cedulaNumero"
            value={formData.cedulaNumero}
            onChange={handleChange}
            placeholder={formData.cedulaTipo === 'J' ? "12345678-9" : "12345678"}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="telefonoPagador">Teléfono del Pagador</label>
        <input
          type="tel"
          id="telefonoPagador"
          name="telefonoPagador"
          value={formData.telefonoPagador}
          onChange={handleChange}
          placeholder="04121234567"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="referencia">Referencia del Pago</label>
        <input
          type="text"
          id="referencia"
          name="referencia"
          value={formData.referencia}
          onChange={handleChange}
          placeholder="123456789012"
          maxLength={12}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="fechaPago">Fecha del Pago</label>
        <input
          type="date"
          id="fechaPago"
          name="fechaPago"
          value={formData.fechaPago}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="bancoOrigen">Banco Origen</label>
        <BankSelect
          value={formData.bancoOrigen}
          onChange={handleChange}
          required
        />
      </div>

      <button type="submit" className="btn btn-success">
        Validar Pago
      </button>
    </form>
  )
}

export default PaymentForm
