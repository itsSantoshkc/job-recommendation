import { useState, createContext, useContext, ReactNode } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from './Button'

interface Toast {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'success' | 'destructive' | 'info'
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { ...toast, id }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000)
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const variants = {
    default: 'bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700',
    success: 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800',
    destructive: 'bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800',
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800',
  }

  const icons = {
    default: null,
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    destructive: <AlertCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  }

  return (
    <div className={cn('flex items-start gap-3 p-4 rounded-lg border shadow-lg min-w-[300px] max-w-md animate-slide-in', variants[toast.variant || 'default'])} role="alert">
      {icons[toast.variant || 'default'] && <div className="flex-shrink-0 mt-0.5">{icons[toast.variant || 'default']}</div>}
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{toast.title}</p>
        {toast.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{toast.description}</p>}
      </div>
      <Button variant="ghost" size="icon" onClick={() => onRemove(toast.id)}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}