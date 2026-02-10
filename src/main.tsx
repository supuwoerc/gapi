import { StrictMode } from 'react'

import { createRoot } from 'react-dom/client'

import { QueryClientProvider } from '@tanstack/react-query'

import '@/style/index.css'

import App from './App.tsx'
import { reactQueryClient } from './constant/react-query.ts'
import { ThemeProvider } from './providers/theme-provider.tsx'

const rootElement = document.getElementById('root')!

if (!rootElement.innerHTML) {
  const root = createRoot(rootElement)
  root.render(
    <StrictMode>
      <QueryClientProvider client={reactQueryClient}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>
  )
}
