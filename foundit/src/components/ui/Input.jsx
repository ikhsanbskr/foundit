import React from 'react';

const Input = ({ 
  label, 
  id, 
  error, 
  className = '', 
  type = 'text',
  ...props 
}) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label htmlFor={id} className="font-bold text-lg">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`neo-border neo-shadow-sm bg-white p-4 font-display text-lg outline-none focus:bg-light-grey transition-colors w-full ${error ? 'border-danger' : ''}`}
        {...props}
      />
      {error && <span className="text-danger font-semibold">{error}</span>}
    </div>
  );
};

export default Input;
