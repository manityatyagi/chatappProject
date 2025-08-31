import React from 'react';
import { cn } from '../../libs/utils';

const ScrollArea = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative overflow-auto", className)}{...props}>
    {children}
  </div>
));

ScrollArea.displayName = "ScrollArea";

const ScrollBar = React.forwardRef(({ className, orientation = "vertical", ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex touch-none select-none transition-colors", orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]", orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]", className)}
    {...props}>
    <div className="relative flex-1 rounded-full bg-secondary-200" />
  </div>
));

ScrollBar.displayName = "ScrollBar";

export { ScrollArea, ScrollBar };
