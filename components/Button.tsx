import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'cta' | 'success';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "py-3 px-4 rounded-xl font-bold transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    // Primary: Brand Blue (Dark Slate)
    primary: "bg-brand-blue hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20",
    
    // CTA: Brand Orange (High Visibility)
    cta: "bg-brand-orange hover:bg-orange-700 text-white shadow-lg shadow-orange-600/30",
    
    // Success: Green
    success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30",
    
    // Secondary: White/Light Gray
    secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm",
    
    // Danger: Ghost Red
    danger: "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200",
    
    // Outline: Blue Border
    outline: "border-2 border-brand-blue text-brand-blue hover:bg-brand-blue/5 bg-transparent",
    
    // Ghost: Transparent
    ghost: "bg-transparent hover:bg-slate-100 text-slate-600"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};