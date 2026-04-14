import bancos from '../data/bancos.json'

function BankSelect({ value, onChange, required = false }) {
  return (
    <select value={value} onChange={onChange} required={required}>
      <option value="">Seleccione un banco</option>
      {bancos.map((banco) => (
        <option key={banco.codigo} value={banco.codigo}>
          {banco.codigo} - {banco.nombre}
        </option>
      ))}
    </select>
  )
}

export default BankSelect
