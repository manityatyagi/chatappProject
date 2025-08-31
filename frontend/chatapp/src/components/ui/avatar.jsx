import React from 'react';

export const Avatar = ({ className = '', children }) => (
  <div className={['relative inline-flex items-center justify-center rounded-full overflow-hidden', className].join(' ')}>
    {children}
  </div>
);

export const AvatarImage = ({ src, alt = '', className = '' }) => (
  <img src={src} alt={alt} className={['h-full w-full object-cover', className].join(' ')} />
);

export const AvatarFallback = ({ children, className = '' }) => (
  <div className={['h-full w-full flex items-center justify-center bg-gray-200 text-gray-700', className].join(' ')}>
    {children}
  </div>
);

export default Avatar;


