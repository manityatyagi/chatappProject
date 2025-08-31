import React from 'react';

export const Badge = ({ children, className = '' }) => (
  <span className={['inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium', className].join(' ')}>
    {children}
  </span>
);

export default Badge;


