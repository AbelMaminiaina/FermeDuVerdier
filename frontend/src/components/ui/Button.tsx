'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

// Style de l'interface : 'shop' (maquette ShopWise, site public) ou 'legacy' (style d'avant le
// redesign, conservé dans l'admin via <UiStyleProvider value="legacy">)
export type UiStyle = 'shop' | 'legacy';
const UiStyleContext = React.createContext<UiStyle>('shop');
export const UiStyleProvider = UiStyleContext.Provider;
export const useUiStyle = () => React.useContext(UiStyleContext);

const legacyStyles = {
  base: 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  variants: {
    primary: 'bg-prairie-600 text-white hover:bg-prairie-700 focus:ring-prairie-500 shadow-md hover:shadow-lg active:shadow-sm',
    secondary: 'bg-terre-500 text-white hover:bg-terre-600 focus:ring-terre-400 shadow-md hover:shadow-lg',
    outline: 'border-2 border-prairie-600 text-prairie-600 hover:bg-prairie-50 focus:ring-prairie-500',
    ghost: 'text-prairie-600 hover:bg-prairie-50 focus:ring-prairie-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-md hover:shadow-lg',
  },
  sizes: {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2',
    xl: 'px-8 py-4 text-xl gap-3',
  },
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const buttonStyle = useUiStyle();

    // Style des boutons de la maquette ShopWise : aplats, coins 6px, 14px medium, sans ombre
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-[3px] disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary:
        'bg-prairie-600 text-white hover:bg-prairie-700 focus:ring-prairie-600/20',
      secondary:
        'bg-transparent text-warm-600 border border-warm-300 hover:bg-white hover:border-warm-400 focus:ring-warm-400/20',
      outline:
        'border border-prairie-600 text-prairie-600 hover:bg-prairie-600 hover:text-white focus:ring-prairie-600/20',
      ghost:
        'text-prairie-600 hover:bg-prairie-600/10 focus:ring-prairie-600/20',
      danger:
        'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600/20',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-[13px] gap-1.5',
      md: 'px-6 py-2.5 text-sm gap-2',
      lg: 'px-7 py-3 text-[15px] gap-2',
      xl: 'px-8 py-3.5 text-base gap-2.5',
    };

    return (
      <button
        ref={ref}
        className={cn(
          buttonStyle === 'legacy' ? legacyStyles.base : baseStyles,
          buttonStyle === 'legacy' ? legacyStyles.variants[variant] : variants[variant],
          buttonStyle === 'legacy' ? legacyStyles.sizes[size] : sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        {!loading && icon && iconPosition === 'left' && (
          <span className="shrink-0">{icon}</span>
        )}
        {children}
        {!loading && icon && iconPosition === 'right' && (
          <span className="shrink-0">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
