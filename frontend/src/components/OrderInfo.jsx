function OrderInfo({ ordenData }) {
  return (
    <div className="order-info">
      <h3>📋 Datos de la Orden</h3>
      
      <div className="label">Monto a Pagar</div>
      <div className="amount">
        {ordenData?.monto_bs?.toFixed(2)} Bs
      </div>

      <div className="beneficiary">
        <div className="beneficiary-item">
          <div className="label">Cédula Beneficiario</div>
          <div className="beneficiary-value">{ordenData?.cedula_beneficiario}</div>
        </div>
        <div className="beneficiary-item">
          <div className="label">Teléfono Beneficiario</div>
          <div className="beneficiary-value">{ordenData?.telefono_beneficiario}</div>
        </div>
      </div>
    </div>
  )
}

export default OrderInfo
