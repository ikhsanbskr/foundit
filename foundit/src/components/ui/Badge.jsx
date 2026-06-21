import React from 'react';

const Badge = ({ children, variant = 'primary', className = '' }) => {
  const variants = {
    primary: 'bg-primary text-black',
    danger: 'bg-danger text-white',
    white: 'bg-white text-black',
    black: 'bg-black text-white'
  };

  return (
    <span className={`neo-border font-bold py-1 px-3 text-sm inline-block ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
