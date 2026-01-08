import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext' 
import LoginPage from './pages/LoginPage'
import CadastroPaciente from './pages/CadastroPaciente'
import PortalPaciente from './pages/PortalPaciente'
import PainelProfissionalSaude from './pages/PainelProfissionalSaude'
import SecretariaSaude from './pages/SecretariaSaude'
import './App.css' 

// Componente de Rota Protegida (Mantendo sua lógica original)
const ProtectedRoute = ({ children, allowedProfiles }) => {
  const { user, isLoading } = useAuth()
  
  if (isLoading) {
    return <div className="loading-screen">Carregando autenticação...</div>
  }

  // Se não houver usuário logado, redireciona para o login
  if (!user) {
    return <Navigate to="/" replace />
  }

  // Se o perfil não for permitido, mostra acesso negado
  const userProfile = user.perfil.toLowerCase()
  const allowed = allowedProfiles.map(p => p.toLowerCase())
  
  if (!allowed.includes(userProfile)) {
    return (
      <div className="error-container">
        <h2>Acesso Negado</h2>
        <p>O seu perfil ({user.perfil}) não tem permissão para acessar esta página.</p>
        <Navigate to="/" replace />
      </div>
    )
  }
  
  return children
}

// Componente Principal de Rotas
const AppContent = () => {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/cadastro" element={<CadastroPaciente />} /> {/* Nova Rota de Cadastro */}
      
      {/* Rotas Protegidas - Perfil: Paciente */}
      <Route 
        path="/portal-paciente" 
        element={
          <ProtectedRoute allowedProfiles={['Paciente']}>
            <PortalPaciente />
          </ProtectedRoute>
        } 
      />

      {/* Rotas Protegidas - Perfil: Profissional */}
      <Route 
        path="/painel-profissional" 
        element={
          <ProtectedRoute allowedProfiles={['Profissional']}>
            <PainelProfissionalSaude />
          </ProtectedRoute>
        } 
      />

      {/* Rotas Protegidas - Perfil: Secretaria */}
      <Route 
        path="/secretaria" 
        element={
          <ProtectedRoute allowedProfiles={['Secretaria']}>
            <SecretariaSaude />
          </ProtectedRoute>
        } 
      />
      
      {/* Redirecionamento Global para qualquer rota inexistente */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <AppContent />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App