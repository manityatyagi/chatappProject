import React, { useState } from 'react';
import { cn } from '../../libs/utils';

const Tooltip = React.forwardRef(({ 
  children, 
  content, 
  side = "top", 
  className,
  delay = 200,
  ...props 
}, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const showTooltip = () => {
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  const sideClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 transform -translate-x-1/2 border-t-secondary-900",
    bottom: "bottom-full left-1/2 transform -translate-x-1/2 border-b-secondary-900",
    left: "left-full top-1/2 transform -translate-y-1/2 border-l-secondary-900",
    right: "right-full top-1/2 transform -translate-y-1/2 border-r-secondary-900",
  };

  return (
    <div
      ref={ref}
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      {...props}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            "absolute z-50 px-2 py-1 text-xs text-white bg-secondary-900 rounded shadow-lg whitespace-nowrap",
            sideClasses[side],
            className
          )}
        >
          {content}
          <div
            className={cn(
              "absolute w-0 h-0 border-4 border-transparent",
              arrowClasses[side]
            )}
          />
        </div>
      )}
    </div>
  );
});

Tooltip.displayName = "Tooltip";

export { Tooltip };
