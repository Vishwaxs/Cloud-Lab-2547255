'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  icon?: string;
  iconPosition?: 'left' | 'right';
  href?: string;
  target?: string;
  rel?: string;
  animate?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  icon,
  iconPosition = 'left',
  href,
  target,
  rel,
  animate = true
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
    outline: 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-blue-500',
    ghost: 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-blue-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const iconClasses = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base';
  const iconSpacing = size === 'sm' ? 'mx-1' : 'mx-2';

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  const ButtonContent = () => (
    <>
      {loading && (
        <motion.div 
          className={`${iconPosition === 'left' ? `mr-${iconSpacing.split('mx-')[1]}` : `ml-${iconSpacing.split('mx-')[1]}`}`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <i className={`fas fa-spinner ${iconClasses}`}></i>
        </motion.div>
      )}
      {!loading && icon && iconPosition === 'left' && (
        <motion.i 
          className={`${icon} ${iconClasses} mr-2`}
          whileHover={animate ? { scale: 1.1, rotate: 5 } : {}}
          transition={{ duration: 0.2 }}
        />
      )}
      {children}
      {!loading && icon && iconPosition === 'right' && (
        <motion.i 
          className={`${icon} ${iconClasses} ml-2`}
          whileHover={animate ? { scale: 1.1, rotate: 5 } : {}}
          transition={{ duration: 0.2 }}
        />
      )}
    </>
  );

  const motionProps = animate ? {
    whileHover: { scale: 1.02, y: -1 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.2 }
  } : {};

  if (href) {
    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return (
        <motion.a
          href={href}
          target={target}
          rel={rel}
          className={buttonClasses}
          {...motionProps}
        >
          <ButtonContent />
        </motion.a>
      );
    } else {
      return (
        <Link href={href} className={buttonClasses}>
          <motion.div {...motionProps} className="w-full h-full flex items-center justify-center">
            <ButtonContent />
          </motion.div>
        </Link>
      );
    }
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={buttonClasses}
      {...motionProps}
    >
      <ButtonContent />
    </motion.button>
  );
};

// Icon Button variant
interface IconButtonProps {
  icon: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  'aria-label': string;
  href?: string;
  target?: string;
  rel?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  'aria-label': ariaLabel,
  href,
  target,
  rel
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
    outline: 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-blue-500',
    ghost: 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-blue-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
  };
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  const ButtonContent = () => (
    <i className={loading ? 'fas fa-spinner animate-spin' : icon}></i>
  );

  if (href) {
    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return (
        <a
          href={href}
          target={target}
          rel={rel}
          className={buttonClasses}
          aria-label={ariaLabel}
        >
          <ButtonContent />
        </a>
      );
    } else {
      return (
        <Link href={href} className={buttonClasses} aria-label={ariaLabel}>
          <ButtonContent />
        </Link>
      );
    }
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={buttonClasses}
      aria-label={ariaLabel}
    >
      <ButtonContent />
    </button>
  );
};

export default Button;
