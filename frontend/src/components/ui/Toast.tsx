import {
  useState,
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "./Button";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "destructive" | "info";
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const TOAST_DURATION = 5000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    const timer = timers.current.get(id);

    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }

    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = crypto.randomUUID();

      setToasts((prev) => [
        ...prev,
        {
          ...toast,
          id,
        },
      ]);

      const timer = setTimeout(() => {
        removeToast(id);
      }, TOAST_DURATION);

      timers.current.set(id, timer);
    },
    [removeToast],
  );

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => clearTimeout(timer));
      timers.current.clear();
    };
  }, []);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}

function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Toast[];
  onRemove: (id: string) => void;
}) {
  return (
    <div
      className="fixed z-50 flex flex-col gap-2 bottom-4 right-4"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  const variants = {
    default: "bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700",

    success:
      "bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800",

    destructive:
      "bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800",

    info: "bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800",
  };

  const icons = {
    default: null,

    success: <CheckCircle className="w-5 h-5 text-green-500" />,

    destructive: <AlertCircle className="w-5 h-5 text-red-500" />,

    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const variant = toast.variant ?? "default";
  const icon = icons[variant];

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg border shadow-lg min-w-[300px] max-w-md animate-slide-in",
        variants[variant],
      )}
      role="alert"
    >
      {icon && <div className="flex-shrink-0 mt-0.5">{icon}</div>}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {toast.title}
        </p>

        {toast.description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {toast.description}
          </p>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(toast.id)}
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
