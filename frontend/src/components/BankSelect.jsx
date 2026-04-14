import { useState, useRef, useEffect } from 'react'
import bancos from '../data/bancos.json'

function BankSelect({ value, onChange, required = false }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const wrapperRef = useRef(null)

  const selectedBanco = bancos.find(b => b.codigo === value)

  const filteredBancos = bancos.filter(banco => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      banco.codigo.toLowerCase().includes(term) ||
      banco.nombre.toLowerCase().includes(term)
    )
  })

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (codigo) => {
    const event = { target: { name: 'bancoOrigen', value: codigo } }
    onChange(event)
    setSearchTerm('')
    setIsOpen(false)
  }

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value)
    setIsOpen(true)
  }

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <input
        type="text"
        placeholder={selectedBanco ? `${selectedBanco.codigo} - ${selectedBanco.nombre}` : "🔍 Buscar banco por código o nombre..."}
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        required={required}
        style={{
          width: '100%',
          padding: '12px 16px',
          fontSize: '16px',
          border: '2px solid #e9ecef',
          borderRadius: '8px',
          outline: isOpen ? '2px solid #667eea' : '2px solid #e9ecef'
        }}
      />

      {isOpen && (
        <ul style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          maxHeight: '200px',
          overflowY: 'auto',
          background: 'white',
          border: '2px solid #e9ecef',
          borderTop: 'none',
          borderRadius: '0 0 8px 8px',
          listStyle: 'none',
          margin: 0,
          padding: 0,
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          {filteredBancos.length === 0 ? (
            <li style={{
              padding: '12px 16px',
              color: '#999',
              fontStyle: 'italic'
            }}>
              No se encontraron bancos
            </li>
          ) : (
            filteredBancos.map((banco) => (
              <li
                key={banco.codigo}
                onClick={() => handleSelect(banco.codigo)}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f0f0f0',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                <span style={{ fontWeight: 'bold', marginRight: '8px' }}>
                  {banco.codigo}
                </span>
                <span style={{ color: '#666' }}>
                  {banco.nombre}
                </span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}

export default BankSelect
