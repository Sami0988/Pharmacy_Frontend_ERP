'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  description?: string;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, ...props }, ref) => {
    return (
      <label className="flex items-center gap-3 cursor-pointer">
        <div
          className={cn(
            'peer relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
            'focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
            props.checked ? 'bg-primary' : 'bg-input',
            className
          )}
        >
          <input
            type="checkbox"
            ref={ref}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            {...props}
          />
          <span
            className={cn(
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
              props.checked ? 'translate-x-5' : 'translate-x-1'
            )}
          />
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <span className="text-sm font-medium text-foreground">{label}</span>
            )}
            {description && (
              <span className="text-xs text-muted-foreground">{description}</span>
            )}
          </div>
        )}
      </label>
    );
  }
);
Switch.displayName = 'Switch';

export { Switch };
