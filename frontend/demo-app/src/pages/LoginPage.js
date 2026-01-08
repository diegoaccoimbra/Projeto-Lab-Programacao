import React, { useState } from 'react'
// hook pra navegar entre as rotas (páginas)
import { useNavigate } from 'react-router-dom' 
import { useAuth } from '../context/AuthContext' 

// Função que autentica o login
const LoginPage = () => {
  // Estados pro id, senha, erro e estado de carregamento da requisição
  const [identificacao, setIdentificacao] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()

  // Função chamada quando o usuário clica em "entrar"
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Chama a função de login axios
      const user = await login({ identificacao, senha }) 

      // Redireciona para uma página de acordo com oo perfil do usuário
      if (user) {
        switch (user.perfil.toLowerCase()) {
          case 'paciente':
            navigate('/portal-paciente') 
            break
          case 'profissional':
            navigate('/painel-profissional') 
            break
          case 'secretaria':
            navigate('/secretaria') 
            break
          default:
            setError('Usuário inválido.')
            break
        }
      }

    }
    catch (err) {
      // Assume que a mensagem de erro está na resposta
      const msg = err.message
      setError(`Erro no login: ${msg}`)
    }
    finally {
      // Desativando o estado de carregamento
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page-container">
      <h2>Qualifica Saúde</h2>
      <p>Entre com seu número de identificação e senha.</p>
      
      <form onSubmit = {handleSubmit} className = "login-form">
        <div className = "form-group">
          <label htmlFor = "identificacao">CPF:</label>
          <input
            id = "identificacao"
            type = "text"
            value = {identificacao}
            onChange = {(e) => setIdentificacao(e.target.value)}
            required
            disabled = {isLoading}
          />
        </div>
        <div className = "form-group">
          <label htmlFor = "senha">Senha:</label>
          <input
            id = "senha"
            type = "password"
            value = {senha}
            onChange = {(e) => setSenha(e.target.value)}
            required
            disabled = {isLoading}
          />
        </div>

        {error && <p className = "error-message">{error}</p>}

        <button type = "submit" disabled = {isLoading}>
          {isLoading ? 'Acessando...' : 'Entrar no Sistema'}
        </button>
      </form>
      
      <div className = "cadastro-link">
        <p><button onClick={() => navigate('/cadastro')}>Não tem uma conta? Cadastre-se agora</button></p>
      </div>
    </div>
  )
}

export default LoginPage