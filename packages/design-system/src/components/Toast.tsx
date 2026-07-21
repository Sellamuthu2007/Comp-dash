import { cn } from '../utils/cn'
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'

interface ToastProps {
  type?: 'success' | 'error' | 'warning' | 'info'
  message: string
  onClose?: () => void
  className?: string
}

const typeConfig = {
  success: { icon: CheckCircle, bg: 'bg-successLight', text: 'text-successDark', iconColor: 'text-success' },
  error: { icon: AlertCircle, bg: 'bg-errorLight', text: 'text-errorDark', iconColor: 'text-error' },
  warning: { icon: AlertTriangle, bg: 'bg-warningLight', text: 'text-warningDark', iconColor: 'text-warning' },
  info: { icon: Info, bg: 'bg-infoLight', text: 'text-infoDark', iconColor: 'text-info' },
}

export function Toast({ type = 'info', message, onClose, className }: ToastProps) {
  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 rounded-2xl shadow-lg border',
        config.bg,
        config.text,
        className
      )}
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0', config.iconColor)} />
      <p className="text-sm font-medium flex-1">{message}</p>
      {onClose && (
        <button onClick={onClose} className="flex-shrink-0" aria-label="Close">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
