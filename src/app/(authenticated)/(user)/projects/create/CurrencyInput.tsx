"use client"

import React, { useState } from 'react';

const CurrencyInput = ({ 
  name, 
  value, 
  onChange, 
  placeholder = "$0.00",
  error,
  required = false
}: any) => {
  const [displayValue, setDisplayValue] = useState('');

  const formatCurrency = (value) => {
    // Remover cualquier caracter que no sea número
    const number = value.replace(/[^\d]/g, '');
    
    // Convertir a número y formatear con comas
    const formatted = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(number));

    // Retornar el valor formateado
    return formatted;
  };

  const handleChange = (e) => {
    const rawValue = e.target.value;
    // Guardar el valor limpio en el input hidden
    const cleanValue = rawValue.replace(/[^\d]/g, '');
    
    // Actualizar el valor mostrado con formato
    setDisplayValue(rawValue);
    
    // Llamar al onChange con el valor numérico limpio
    if (onChange) {
      const numberValue = cleanValue === '' ? '' : Number(cleanValue);
      onChange({
        target: {
          name,
          value: numberValue
        }
      });
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full bg-[#F2F0F1] rounded-[20px] py-2 px-4 outline-none text-gray-500 text-sm
          ${error ? 'border-2 border-red-500' : ''}`}
      />
      <input 
        type="hidden"
        name={name}
        value={value}
        required={required}
      />
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
};

export default CurrencyInput;