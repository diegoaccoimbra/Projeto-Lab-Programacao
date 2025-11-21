import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext' 
import LoginPage from './pages/LoginPage'
import PortalPaciente from './pages/PortalPaciente'
import PainelProfissionalSaude from './pages/PainelProfissionalSaude'
import SecretariaSaude from './pages/SecretariaSaude'
import './App.css' 

// Componente de Rota Protegida
const ProtectedRoute = ({ children, allowedProfiles }) => {
  const { user, isLoading } = useAuth()
  
  if (isLoading) {
    return <div>Carregando autenticação...</div>
  }

  // Se não houver usuário logado, redireciona para o login
  if (!user) {
    return <Navigate to = "/" replace />
  }

  // Se o perfil não for permitido, mostra acesso negado
  const userProfile = user.perfil.toLowerCase()
  const allowed = allowedProfiles.map(p => p.toLowerCase())
  
  if (!allowed.includes(userProfile)) {
    // Pode redirecionar para uma página de erro ou mostrar uma mensagem
    return <div>O seu perfil ({user.perfil}) não tem permissão para acessar esta página.</div>
  }
  
  return children
}

// Componente Principal
const AppContent = () => {
  return (
    <Routes>
      <Route path  ="/" element = {<LoginPage />} />
      
      <Route 
        path = "/portal-paciente" 
        element = {
          <ProtectedRoute allowedProfiles = {['Paciente']}>
            <PortalPaciente />
          </ProtectedRoute>
        } 
      />

      <Route 
        path = "/painel-profissional" 
        element = {
          <ProtectedRoute allowedProfiles = {['Profissional']}>
            <PainelProfissionalSaude />
          </ProtectedRoute>
        } 
      />

      <Route 
        path = "/secretaria" 
        element = {
          <ProtectedRoute allowedProfiles = {['Secretaria']}>
            <SecretariaSaude />
          </ProtectedRoute>
        } 
      />
      
      <Route path = "*" element = {<Navigate to=  "/" replace />} />
    </Routes>
  )
}

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className = "App">
          <AppContent />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App