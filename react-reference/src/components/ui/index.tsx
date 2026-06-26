import React, { useEffect, useState } from 'react';
import { cn } from '@/utils/formatting';

// ─── Badge ─────────────────────────────────────────────────────────────────────

type BadgeVariant = 'success' | 'warn' | 'danger' | 'info' | 'neutral';

const BADGE_CLS: Record<BadgeVariant, string> = {
  success: 'bg-sg-100 text-sg-700',
  warn: 'bg-sa-100 text-sa-600',
  danger: 'bg-sr-100 text-sr-600',
  info: 'bg-sb-100 text-sb-600',
  neutral: 'bg-gray-100 text-gray-600',
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold whitespace-nowrap',
        BADGE_CLS[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// ─── Button ────────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'accent' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const BTN_VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-navy-900 text-white hover:bg-navy-800 border-transparent',
  accent: 'bg-sg-600 text-white hover:bg-sg-700 border-transparent',
  outline: 'bg-white text-navy-900 border-gray-300 hover:border-navy-700 hover:bg-gray-50',
  ghost: 'bg-transparent text-gray-600 border-transparent hover:bg-gray-100 hover:text-gray-900',
  danger: 'bg-sr-100 text-sr-600 border-transparent hover:bg-sr-600 hover:text-white',
};

const BTN_SIZE: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-5 py-3 text-base rounded-xl gap-2',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  className,
  disabled,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-bold border transition-all duration-150 cursor-pointer',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        BTN_VARIANT[variant],
        BTN_SIZE[size],
        className
      )}
    >
      {loading ? <Spinner size={14} /> : children}
    </button>
  );
}

// ─── Card ──────────────────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({ children, className, padding = true }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white border border-gray-200 rounded-2xl shadow-sm',
        padding && 'p-5',
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardTitleProps {
  icon?: React.ReactNode;
  children: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}

export function CardTitle({ icon, children, right, className }: CardTitleProps) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      <div className="flex items-center gap-2 font-display font-extrabold text-[14.5px] text-navy-900">
        {icon && <span className="text-sb-500">{icon}</span>}
        {children}
      </div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </div>
  );
}

// ─── Spinner ───────────────────────────────────────────────────────────────────

interface SpinnerProps {
  size?: number;
  className?: string;
}

export function Spinner({ size = 16, className }: SpinnerProps) {
  return (
    <span
      style={{ width: size, height: size }}
      className={cn(
        'inline-block rounded-full border-2 border-sb-100 border-t-sb-500 animate-spin flex-shrink-0',
        className
      )}
    />
  );
}

// ─── Divider ───────────────────────────────────────────────────────────────────

export function Divider({ className }: { className?: string }) {
  return <hr className={cn('border-gray-200', className)} />;
}

// ─── Modal ─────────────────────────────────────────────────────────────────────

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-md' }: ModalProps) {
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-navy-900/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={cn(
          'bg-white rounded-2xl shadow-2xl w-full p-6 relative animate-toastIn',
          maxWidth
        )}
      >
        {title && (
          <div className="font-display font-extrabold text-[16px] text-navy-900 mb-1 pr-8">
            {title}
          </div>
        )}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors p-1"
          aria-label="Close"
        >
          <XIcon size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}

// ─── Toast ─────────────────────────────────────────────────────────────────────

interface ToastItem {
  id: string;
  message: string;
}

let toastListener: ((msg: string) => void) | null = null;

export function showToast(message: string) {
  toastListener?.(message);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    toastListener = (message) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3200);
    };
    return () => { toastListener = null; };
  }, []);

  return (
    <div className="fixed bottom-7 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="bg-navy-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-xl flex items-center gap-2 animate-toastIn"
        >
          <CheckIcon size={14} className="text-sg-500" />
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ─── Inline SVG icons ──────────────────────────────────────────────────────────

interface IconProps {
  size?: number;
  className?: string;
}

const iconProps = (size: number, className?: string) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className,
});

export const HomeIcon = ({ size = 18, className }: IconProps) => (
  <svg {...iconProps(size, className)}>
    <path d="M4 11.2 12 4l8 7.2" /><path d="M6.5 9.8V20h11V9.8" /><path d="M10 20v-6h4v6" />
  </svg>
);
export const FolderIcon = ({ size = 18, className }: IconProps) => (
  <svg {...iconProps(size, className)}>
    <path d="M3 7.5h6l2 2h10v9.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" />
  </svg>
);
export const ChatIcon = ({ size = 18, className }: IconProps) => (
  <svg {...iconProps(size, className)}>
    <path d="M4 5.5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 3.5v-3.5H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z" />
  </svg>
);
export const UserIcon = ({ size = 18, className }: IconProps) => (
  <svg {...iconProps(size, className)}>
    <circle cx="12" cy="8.3" r="3.3" /><path d="M5 20c.8-3.8 3.6-5.8 7-5.8s6.2 2 7 5.8" />
  </svg>
);
export const UploadIcon = ({ size = 18, className }: IconProps) => (
  <svg {...iconProps(size, className)}>
    <path d="M7.5 17.5h9a3.5 3.5 0 0 0 .6-6.95A5 5 0 0 0 7.2 9.3 4 4 0 0 0 7.5 17.5Z" />
    <path d="M12 14V8m0 0-2.3 2.3M12 8l2.3 2.3" />
  </svg>
);
export const CheckIcon = ({ size = 18, className }: IconProps) => (
  <svg {...iconProps(size, className)}>
    <path d="M5 12.3 9 16 19 6" />
  </svg>
);
export const AlertIcon = ({ size = 18, className }: IconProps) => (
  <svg {...iconProps(size, className)}>
    <path d="M10.3 4.5 2.9 17.8a1.3 1.3 0 0 0 1.1 2h16a1.3 1.3 0 0 0 1.1-2L13.7 4.5a1.3 1.3 0 0 0-2.4 0Z" />
    <path d="M12 10v4" /><circle cx="12" cy="16.8" r="0.4" fill="currentColor" />
  </svg>
);
export const SendIcon = ({ size = 18, className }: IconProps) => (
  <svg {...iconProps(size, className)}>
    <path d="M21 3 11 13" /><path d="M21 3 14.5 21l-3.5-8L3 9Z" />
  </svg>
);
export const CopyIcon = ({ size = 18, className }: IconProps) => (
  <svg {...iconProps(size, className)}>
    <rect x="8.5" y="8.5" width="11" height="11" rx="2" />
    <path d="M5.5 15.5h-1a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
export const PhoneIcon = ({ size = 18, className }: IconProps) => (
  <svg {...iconProps(size, className)}>
    <path d="M6 3.5h3l1.5 4-2 1.6a12 12 0 0 0 5.4 5.4l1.6-2 4 1.5v3a1.7 1.7 0 0 1-1.85 1.7A16 16 0 0 1 4.3 5.35 1.7 1.7 0 0 1 6 3.5Z" />
  </svg>
);
export const XIcon = ({ size = 18, className }: IconProps) => (
  <svg {...iconProps(size, className)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
export const BridgeIcon = ({ size = 18, className }: IconProps) => (
  <svg {...iconProps(size, className)}>
    <path d="M3 16.5c2-3 4-4.5 9-4.5s7 1.5 9 4.5" />
    <path d="M5.5 16.5V12M9 16.5v-6M12 16.5V9M15 16.5v-6M18.5 16.5V12" />
    <path d="M3 19h18" />
  </svg>
);
export const SparkleIcon = ({ size = 18, className }: IconProps) => (
  <svg {...iconProps(size, className)}>
    <path d="M12 3.5c.4 2.7 1.3 4.4 2.5 5.6 1.2 1.2 2.9 2.1 5.6 2.5-2.7.4-4.4 1.3-5.6 2.5-1.2 1.2-2.1 2.9-2.5 5.6-.4-2.7-1.3-4.4-2.5-5.6-1.2-1.2-2.9-2.1-5.6-2.5 2.7-.4 4.4-1.3 5.6-2.5 1.2-1.2 2.1-2.9 2.5-5.6Z" />
  </svg>
);
export const TargetIcon = ({ size = 18, className }: IconProps) => (
  <svg {...iconProps(size, className)}>
    <circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="0.6" fill="currentColor" />
  </svg>
);
export const TrendIcon = ({ size = 18, className }: IconProps) => (
  <svg {...iconProps(size, className)}>
    <path d="M3.5 16 9 10.2l4 3.6 7-7.8" /><path d="M16.5 6h4v4" />
  </svg>
);
export const ShieldIcon = ({ size = 18, className }: IconProps) => (
  <svg {...iconProps(size, className)}>
    <path d="M12 3.5 19.5 6.5v5.2c0 5-3.2 8.2-7.5 9.8-4.3-1.6-7.5-4.8-7.5-9.8V6.5Z" />
    <path d="M9 12l2.2 2.2L15.5 9.7" />
  </svg>
);
export const FileIcon = ({ size = 18, className }: IconProps) => (
  <svg {...iconProps(size, className)}>
    <path d="M7 3.5h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1Z" />
    <path d="M14 3.5V8h4" /><path d="M9 13h6M9 16.5h6" />
  </svg>
);
export const BuildingIcon = ({ size = 18, className }: IconProps) => (
  <svg {...iconProps(size, className)}>
    <path d="M5 20.5V5.5a1 1 0 0 1 1-1h6.5a1 1 0 0 1 1 1v15" />
    <path d="M13.5 11h4.5a1 1 0 0 1 1 1v8.5" />
    <path d="M8 8.5h1.5M8 12h1.5M8 15.5h1.5M14.5 14h1.5M14.5 17h1.5" />
    <path d="M3 20.5h18" />
  </svg>
);
export const RefreshIcon = ({ size = 18, className }: IconProps) => (
  <svg {...iconProps(size, className)}>
    <path d="M4 12a8 8 0 0 1 13.6-5.7L20 8.5" /><path d="M20 4v4.5h-4.5" />
    <path d="M20 12a8 8 0 0 1-13.6 5.7L4 15.5" /><path d="M4 20v-4.5h4.5" />
  </svg>
);
export const PlusIcon = ({ size = 18, className }: IconProps) => (
  <svg {...iconProps(size, className)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const ClockIcon = ({ size = 18, className }: IconProps) => (
  <svg {...iconProps(size, className)}>
    <circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" />
  </svg>
);
export const KeyIcon = ({ size = 18, className }: IconProps) => (
  <svg {...iconProps(size, className)}>
    <circle cx="7.5" cy="15.5" r="4" />
    <path d="M10.5 12.5L20 3" /><path d="M17.5 5.5l2 2" /><path d="M14.5 8.5l1.5 1.5" />
  </svg>
);
