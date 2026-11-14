import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'
import { queryClient } from './lib/queryClient'
import { ToastProvider } from './components/ui/Toast'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
        <TanStackRouterDevtools />
      </ToastProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
