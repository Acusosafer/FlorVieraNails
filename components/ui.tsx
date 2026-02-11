
import React from 'react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'danger' }> = ({ 
  children, 
  className = '', 
  variant = 'primary', 
  ...props 
}) => {
  const baseStyles = "px-4 py-2 rounded-full font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base";
  
  const variants = {
    primary: "bg-rose-500 text-white hover:bg-rose-600 focus:ring-rose-500 shadow-sm hover:shadow-md",
    secondary: "bg-rose-100 text-rose-700 hover:bg-rose-200 focus:ring-rose-300",
    outline: "border-2 border-rose-200 text-rose-600 hover:bg-rose-50 focus:ring-rose-200",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-200"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ 
  label, 
  className = '', 
  id,
  ...props 
}) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label htmlFor={id} className="text-xs font-semibold text-rose-700 uppercase tracking-wider ml-1">{label}</label>}
      <input 
        id={id}
        className={`px-4 py-2 rounded-xl border-2 border-rose-50 focus:border-rose-300 focus:ring-0 transition-colors outline-none bg-white/70 backdrop-blur-sm ${className}`} 
        {...props} 
      />
    </div>
  );
};

export const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-rose-100/50 ${className}`}>
    {children}
  </div>
);

export const Badge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    pendiente: "bg-amber-100 text-amber-700",
    aceptado: "bg-emerald-100 text-emerald-700",
    rechazado: "bg-red-100 text-red-700"
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${styles[status] || 'bg-gray-100'}`}>
      {status}
    </span>
  );
};
