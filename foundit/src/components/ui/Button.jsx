import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  fullWidth = false,
  ...props 
}) => {
  const baseStyles = 'neo-border neo-shadow font-bold py-3 px-6 transition-transform neo-shadow-hover flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-primary text-black',
    danger: 'bg-danger text-white',
    white: 'bg-white text-black',
    black: 'bg-black text-white'
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
