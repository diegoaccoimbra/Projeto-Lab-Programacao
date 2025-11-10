import { useState } from "react"
import { useNavigate } from "react-router-dom"

function LoginPage() {
  const [cpf, setCpf] = useState("")
  const navigate = useNavigate()

  function handleLogin(e) {
    e.preventDefault()
    // Exemplo simples: redireciona conforme tipo de usuário
    if (cpf.startsWith("1")) navigate("/paciente")
    else navigate("/profissional")
  }

  return (
    <div className = "login-container">
      <h2>Acesso ao Sistema</h2>
      <form onSubmit = {handleLogin}>
        <input
          type = "text"
          placeholder = "Digite seu CPF"
          value = {cpf}
          onChange = {(e) => setCpf(e.target.value)}
        />
        <button type = "submit">Entrar</button>
      </form>
    </div>
  )
}

export default LoginPage
