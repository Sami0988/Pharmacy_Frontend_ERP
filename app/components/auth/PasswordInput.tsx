'use client';

import { useState, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  showIcon?: boolean;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, error, showIcon = true, ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className="space-y-1 sm:space-y-1.5">
        {label && (
          <label className="block text-xs sm:text-sm font-semibold text-foreground">
            {label}
          </label>
        )}
        <div className="relative group">
          {showIcon && (
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
          )}
          <input
            ref={ref}
            type={visible ? 'text' : 'password'}
            className={cn(
              'flex h-10 sm:h-11 w-full rounded-xl border border-input bg-card text-foreground py-2 text-sm',
              'placeholder:text-muted-foreground/60',
              'focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500',
              'transition-all duration-200',
              'disabled:cursor-not-allowed disabled:opacity-50',
              showIcon ? 'pl-10 pr-10' : 'pl-4 pr-10',
              error && 'border-red-500 focus:ring-red-500/20 focus:border-red-500',
              className
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors rounded-lg p-0.5 hover:bg-muted"
            tabIndex={-1}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
