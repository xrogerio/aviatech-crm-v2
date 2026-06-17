/* Main App Component - Handles routing (using react-router-dom), query client and other providers */
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { LeadsProvider } from '@/context/LeadsContext'
import { AuthProvider } from '@/context/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Index from './pages/Index'
import Leads from './pages/Leads'
import Projects from './pages/Projects'
import Pipeline from './pages/Pipeline'
import Activities from './pages/Activities'
import Proposals from './pages/Proposals'
import Users from './pages/Users'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import LandingPage from './pages/LandingPage'
import Layout from './components/Layout'
import Settings from './pages/Settings'
import Deadlines from './pages/Deadlines'
import { ThemeProvider } from '@/components/theme-provider'

const App = () => (
  <BrowserRouter
    future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
  >
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AuthProvider>
        <LeadsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Landing Page Route */}
              <Route path="/adapta" element={<LandingPage />} />

              <Route path="/login" element={<Login />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/leads" element={<Leads />} />
                  <Route path="/projetos" element={<Projects />} />
                  <Route path="/pipeline" element={<Pipeline />} />
                  <Route path="/tarefas" element={<Activities />} />
                  <Route path="/propostas" element={<Proposals />} />
                  <Route path="/usuarios" element={<Users />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/deadlines" element={<Deadlines />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </LeadsProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
)

export default App
