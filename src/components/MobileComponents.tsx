import React from 'react';
import { ChevronRight } from 'lucide-react';

interface MobileTableCardProps {
  title: string;
  items: Array<{
    label: string;
    value: React.ReactNode;
    className?: string;
  }>;
  actions?: React.ReactNode;
  onExpand?: () => void;
  className?: string;
}

export default function MobileTableCard({ 
  title, 
  items, 
  actions,
  onExpand,
  className = '' 
}: MobileTableCardProps) {
  return (
    <div className={`mobile-table-card ${className}`}>
      {/* Header */}
      <div className="mobile-table-header flex items-center justify-between">
        <h3 className="font-medium truncate">{title}</h3>
        {onExpand && (
          <button 
            onClick={onExpand}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* Content */}
      <div className="mobile-table-row">
        {items.map((item, index) => (
          <div key={index} className="mobile-table-cell">
            <span className="mobile-table-label">{item.label}</span>
            <span className={`mobile-table-value ${item.className || ''}`}>
              {item.value}
            </span>
          </div>
        ))}
        
        {/* Actions */}
        {actions && (
          <div className="mobile-table-cell border-t border-gray-100 pt-3 mt-3">
            <div className="flex gap-2 justify-end w-full">
              {actions}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface ResponsiveTableProps {
  desktop: React.ReactNode;
  mobile: React.ReactNode;
  className?: string;
}

interface ResponsiveTableProps {
  desktop: React.ReactNode;
  mobile: React.ReactNode;
  className?: string;
}

interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

interface MobileStatsGridProps {
  stats: Array<{
    label: string;
    value: React.ReactNode;
    icon?: React.ComponentType<{ className?: string }>;
    color?: string;
    change?: string;
    changeType?: 'positive' | 'negative';
  }>;
  columns?: 1 | 2 | 3;
  className?: string;
}

interface MobileFormProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
}

interface MobileFormFieldProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
  className?: string;
}

interface MobileButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export function ResponsiveTable({ desktop, mobile, className = '' }: ResponsiveTableProps) {
  return (
    <div className={className}>
      {/* Desktop Table */}
      <div className="hidden sm:block">
        {desktop}
      </div>
      
      {/* Mobile Cards */}
      <div className="sm:hidden space-y-3">
        {mobile}
      </div>
    </div>
  );
}

export function MobileModal({ isOpen, onClose, title, children, footer }: MobileModalProps) {
  if (!isOpen) return null;

  return (
    <div className="mobile-modal sm:fixed sm:inset-0 sm:z-50 sm:bg-black sm:bg-opacity-50 sm:flex sm:items-center sm:justify-center sm:p-4">
      <div className="mobile-modal-content sm:bg-white sm:rounded-lg sm:max-w-md sm:w-full sm:max-h-[90vh] sm:overflow-hidden">
        {/* Header */}
        <div className="mobile-modal-header">
          <h2 className="mobile-modal-title">{title}</h2>
          <button 
            onClick={onClose}
            className="mobile-modal-close"
          >
            ×
          </button>
        </div>
        
        {/* Body */}
        <div className="mobile-modal-body">
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="mobile-modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function MobileStatsGrid({ stats, columns = 2, className = '' }: MobileStatsGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'mobile-grid-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-3 ${className}`}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="mobile-stat-card">
            <div className="mobile-stat-header">
              {Icon && (
                <div className={`mobile-stat-icon ${stat.color ? `bg-${stat.color}-500` : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
              )}
              {stat.change && (
                <div className={`mobile-stat-change ${stat.changeType || 'positive'}`}>
                  {stat.change}
                </div>
              )}
            </div>
            <div className="mobile-stat-label">{stat.label}</div>
            <div className="mobile-stat-value">{stat.value}</div>
          </div>
        );
      })}
    </div>
  );
}

export function MobileForm({ children, onSubmit, className = '' }: MobileFormProps) {
  return (
    <form onSubmit={onSubmit} className={`space-y-4 ${className}`}>
      {children}
    </form>
  );
}

export function MobileFormField({ label, children, required, error, className = '' }: MobileFormFieldProps) {
  return (
    <div className={`mobile-form-group ${className}`}>
      <label className="mobile-form-label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}

export function MobileButton({ 
  children, 
  variant = 'primary', 
  size = 'md',
  fullWidth = false,
  disabled = false,
  onClick,
  type = 'button',
  className = ''
}: MobileButtonProps) {
  const variants = {
    primary: 'mobile-form-button',
    secondary: 'mobile-form-button mobile-form-button-secondary',
    danger: 'mobile-form-button bg-red-500 hover:bg-red-600 text-white'
  };

  const sizes = {
    sm: 'min-h-10 px-3 text-sm',
    md: 'min-h-12 px-4',
    lg: 'min-h-14 px-6 text-lg'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
