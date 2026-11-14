import { cn } from '../../lib/utils'
import { getStatusColor } from '../../lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'status'
  status?: string
}

export const Badge = ({ className, variant = 'default', status, ...props }: BadgeProps) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
    secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
    destructive: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    outline: 'border border-gray-300 bg-transparent dark:border-gray-600',
    status: status ? getStatusColor(status) : 'bg-gray-100 text-gray-800',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  )
}