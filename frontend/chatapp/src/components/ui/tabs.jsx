import React, { useState } from 'react';

export const Tabs = ({ children, value, onValueChange, className = '' }) => {
  const [internal, setInternal] = useState(value || '');
  const active = value !== undefined ? value : internal;
  const setActive = (v) => {
    if (onValueChange) onValueChange(v);
    else setInternal(v);
  };
  return (
    <div className={className} data-active-tab={active} data-set-active={setActive}>
      {React.Children.map(children, (child) => React.cloneElement(child, { active, setActive }))}
    </div>
  );
};

export const TabsList = ({ children, className = '' }) => (
  <div className={['flex gap-2', className].join(' ')}>{children}</div>
);

export const TabsTrigger = ({ value, children, className = '', active, setActive }) => {
  const isActive = active === value;
  return (
    <button
      className={['px-3 py-2 text-sm rounded-md border', isActive ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200', className].join(' ')}
      onClick={() => setActive(value)}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, children, className = '', active }) => {
  if (active !== value) return null;
  return <div className={className}>{children}</div>;
};

export default Tabs;


