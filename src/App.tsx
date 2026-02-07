import Login from './pages/login'
import { ThemeProvider } from './providers/theme-provider'

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Login />
      <div className="flex items-center justify-center font-bold">Hello gapi</div>
    </ThemeProvider>
  )
}

export default App
