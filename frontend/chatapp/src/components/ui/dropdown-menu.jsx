import React, { useState, useRef, useEffect } from 'react';

export const DropdownMenu = ({ children }) => <div className="relative inline-block">{children}</div>;

export const DropdownMenuTrigger = ({ asChild = false, children }) => {
  return React.cloneElement(children, { 'data-dropdown-trigger': true });
};

export const DropdownMenuContent = ({ children, align = 'start', className = '' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const trigger = ref.current?.previousSibling?.querySelector('[data-dropdown-trigger]') || ref.current?.previousSibling;
    if (!trigger) return;
    const toggle = (e) => { e.preventDefault(); setOpen((v) => !v); };
    trigger.addEventListener('click', toggle);
    return () => trigger.removeEventListener('click', toggle);
  }, []);

  return (
    <div ref={ref} className={[
      'absolute mt-2 z-50 min-w-[10rem] rounded-md border bg-white p-2 shadow-md',
      align === 'end' ? 'right-0' : 'left-0',
      className,
    ].join(' ')} style={{ display: open ? 'block' : 'none' }}>
      {children}
    </div>
  );
};

export const DropdownMenuItem = ({ children, className = '', ...props }) => (
  <div className={['px-3 py-2 rounded-md text-sm cursor-pointer hover:bg-gray-100', className].join(' ')} {...props}>
    {children}
  </div>
);

export const DropdownMenuSeparator = () => (
  <div className="my-2 h-px bg-gray-200" />
);

export default DropdownMenu;


