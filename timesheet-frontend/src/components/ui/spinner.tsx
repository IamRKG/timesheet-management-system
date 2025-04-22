import React from 'react';
import { cn } from '../../lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'white';
  label?: string;
  className?: string;
}

export function Spinner({ 
  size = 'md', 
  variant = 'primary',
  label,
  className 
}: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const variantClasses = {
    primary: 'border-navy-600 border-t-transparent',
    white: 'border-white border-t-transparent'
  };

  return (
    <div className={cn('flex items-center', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-4',
          sizeClasses[size],
          variantClasses[variant]
        )}
      />
      {label && (
        <span className="ml-3 text-sm font-medium text-gray-700">{label}</span>
      )}
    </div>
  );
}