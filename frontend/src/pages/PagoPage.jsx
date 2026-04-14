import { useState, useEffect } from 'react'
import OrderInfo from '../components/OrderInfo'
import PaymentForm from '../components/PaymentForm'
import { confirmarPago } from '../services/api'

function PagoPage({ ordenData, uuid }) {
  const [step, setStep] = useState('form') // 'form' | 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('')
  const [resultData, setResultData] = useState(null)

  useEffect(() => {
    if (step === 'success') {
      const timer = setTimeout(() => {
        window.close()
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [step])

  const handleSubmit = async (formData) => {
    setStep('loading')
    setErrorMessage('')

    try {
      const response = await confirmarPago({
        orden_pago_uuid: uuid,
        cedulaPagador: formData.cedulaPagador,
        telefonoPagador: formData.telefonoPagador,
        referencia: formData.referencia,
        fechaPago: formData.fechaPago,
        importe: ordenData.monto_usd.toString(),
        bancoOrigen: formData.bancoOrigen,
      })

      if (response.success && response.code === 1000) {
        setResultData({
          referencia: formData.referencia,
          monto: ordenData.monto_bs,
        })
        setStep('success')
      } else {
        setErrorMessage(response.message || 'El pago no fue validado')
        setStep('error')
      }
    } catch (error) {
      console.error('Error:', error)
      setErrorMessage(error.message || 'Error al procesar el pago')
      setStep('error')
    }
  }

  const handleRetry = () => {
    setStep('form')
    setErrorMessage('')
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Pago Móvil</h1>
        <p>Complete los datos del pago</p>
      </div>

      <div className="content">
        <OrderInfo ordenData={ordenData} />

        {step === 'loading' && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Procesando pago...</p>
          </div>
        )}

        {step === 'error' && (
          <div>
            <div className="error" style={{ marginBottom: '20px' }}>
              <p>{errorMessage}</p>
            </div>
            <button className="btn" onClick={handleRetry}>
              Intentar de nuevo
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="success">
            <div className="success-icon">✅</div>
            <h3>¡Pago Confirmado!</h3>
            <p>Tu pago ha sido procesado exitosamente.</p>
            <p>Recibirás un mensaje de WhatsApp con los detalles de tu pedido.</p>
            <p style={{ marginTop: '12px' }}>
              <strong>Referencia:</strong> {resultData?.referencia}
            </p>
            <p>
              <strong>Monto:</strong> {resultData?.monto?.toFixed(2)} Bs
            </p>
            <p style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
              Esta ventana se cerrará en 4 segundos...
            </p>
          </div>
        )}

        {step === 'form' && (
          <PaymentForm 
            onSubmit={handleSubmit} 
            telefonoInicial={ordenData.telefono_cliente} 
          />
        )}
      </div>
    </div>
  )
}

export default PagoPage
