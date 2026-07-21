import { cn } from '../utils/cn'
import { type NotificationType } from '@comp-dash/types'

interface NotificationItemProps {
  type: NotificationType
  title: string
  message: string
  time: string
  isRead: boolean
  onPress?: () => void
  className?: string
}

const typeColors: Record<NotificationType, { bg: string; icon: string }> = {
  verification_update: { bg: 'bg-successLight', icon: 'text-success' },
  new_competition: { bg: 'bg-primary-100', icon: 'text-primary-600' },
  deadline_reminder: { bg: 'bg-warningLight', icon: 'text-warning' },
  registration_confirmed: { bg: 'bg-infoLight', icon: 'text-info' },
  registration_rejected: { bg: 'bg-errorLight', icon: 'text-error' },
  system: { bg: 'bg-gray-100', icon: 'text-gray-600' },
  winner_announced: { bg: 'bg-accentLight', icon: 'text-accent' },
}

const typeIcons: Record<NotificationType, string> = {
  verification_update: '✓',
  new_competition: '🏆',
  deadline_reminder: '⏰',
  registration_confirmed: '📋',
  registration_rejected: '✕',
  system: '⚙',
  winner_announced: '🎉',
}

export function NotificationItem({
  type,
  title,
  message,
  time,
  isRead,
  onPress,
  className,
}: NotificationItemProps) {
  const colors = typeColors[type]
  const icon = typeIcons[type]

  return (
    <button
      onClick={onPress}
      className={cn(
        'w-full flex items-start gap-3 p-4 text-left transition-colors duration-150',
        'hover:bg-gray-50 rounded-2xl',
        !isRead && 'bg-primary-50/50',
        className
      )}
    >
      <div className={cn('w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-base', colors.bg, colors.icon)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-sm font-medium text-gray-900', !isRead && 'font-semibold')}>
            {title}
          </p>
          {!isRead && (
            <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1.5" />
          )}
        </div>
        <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{message}</p>
        <p className="text-xs text-gray-400 mt-1">{time}</p>
      </div>
    </button>
  )
}
