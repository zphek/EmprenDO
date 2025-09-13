"use client";

interface CurrencyInputProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({ 
  name, 
  value, 
  onChange, 
  error, 
  required 
}) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <span className="text-gray-500 sm:text-sm">$</span>
      </div>
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full pl-7 pr-12 bg-[#F2F0F1] rounded-[20px] py-2 outline-none text-gray-500 text-sm
          ${error ? 'border-2 border-red-500' : ''}`}
        placeholder="0.00"
        required={required}
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <span className="text-gray-500 sm:text-sm">USD</span>
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
};

export default CurrencyInput;