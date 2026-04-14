import { useState, useEffect } from 'react'
import PagoPage from './pages/PagoPage'

function App() {
  const [ordenData, setOrdenData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [uuid, setUuid] = useState(null)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const ordenUuid = urlParams.get('id')
    
    if (!ordenUuid) {
      setError('URL inválida. Falta el parámetro ?id=')
      setLoading(false)
      return
    }

    setUuid(ordenUuid)
    
    fetch(`/api/ordenes-pago/${ordenUuid}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrdenData(data.data)
        } else {
          setError(data.message || 'Orden no encontrada')
        }
        setLoading(false)
      })
      .catch(err => {
        setError('Error de conexión con el servidor')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando información de la orden...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="header">
          <h1>Error</h1>
        </div>
        <div className="content">
          <div className="error">
            <p>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return <PagoPage ordenData={ordenData} uuid={uuid} />
}

export default App
