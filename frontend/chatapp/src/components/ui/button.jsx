import React from 'react';
import { cn } from '../../libs/utils';

export const Button = ({ children, className = '', variant = 'default', size = 'md', ...props }) => {
  const base = 'inline-flex items-center justify-center rounded-md border text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
  const variants = {
    default: 'bg-primary-600 text-white hover:bg-primary-700 border-transparent',
    ghost: 'bg-transparent hover:bg-secondary-100 border-transparent',
    outline: 'bg-transparent border-secondary-300 hover:bg-secondary-50',
    secondary: 'bg-secondary-100 text-secondary-900 hover:bg-secondary-200 border-transparent',
  };
  const sizes = {
    md: 'h-10 px-4 py-2',
    sm: 'h-8 px-3',
    lg: 'h-11 px-8',
    icon: 'h-10 w-10 p-0',
  };
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
};

export default Button;


