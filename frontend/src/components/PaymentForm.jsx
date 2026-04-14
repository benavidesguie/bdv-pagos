import { useState } from 'react'
import BankSelect from './BankSelect'

function PaymentForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    cedulaPagador: '',
    telefonoPagador: '',
    referencia: '',
    fechaPago: new Date().toISOString().split('T')[0],
    bancoOrigen: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="cedulaPagador">Cédula del Pagador</label>
        <input
          type="text"
          id="cedulaPagador"
          name="cedulaPagador"
          value={formData.cedulaPagador}
          onChange={handleChange}
          placeholder="V-12345678 ó J-12345678-9"
          required
        />
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
