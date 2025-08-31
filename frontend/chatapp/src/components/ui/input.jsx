import React from 'react';
import { cn } from '../../libs/utils';

export const Input = ({ className, ...props }) => {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-md border border-secondary-300 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-secondary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
};

export default Input;


