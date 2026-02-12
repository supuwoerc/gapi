import { StrictMode } from 'react'

import { createRoot } from 'react-dom/client'

import { QueryClientProvider } from '@tanstack/react-query'

import '@/style/index.css'
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'

import '@/lib/i18n.ts'

import { reactQueryClient } from './lib/react-query.ts'
import { ThemeProvider } from './providers/theme-provider.tsx'
import routes from './routes/index.tsx'

const router = createBrowserRouter(routes)

const rootElement = document.getElementById('root')!

if (!rootElement.innerHTML) {
  const root = createRoot(rootElement)
  root.render(
    <StrictMode>
      <QueryClientProvider client={reactQueryClient}>
        <ThemeProvider>
          <RouterProvider router={router} />
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>
  )
}
