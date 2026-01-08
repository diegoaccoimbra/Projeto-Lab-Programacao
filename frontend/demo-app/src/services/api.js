import axios from 'axios'

// URL base da API (endereço do back-end)
const API_BASE_URL = 'http://localhost:5000/api'

// Simulando o acesso (REMOVER AO IMPLEMENTAR O BACK-END)
const is_test = true

// Criando e configurando a instância do Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    // Tipo de conteúdo padrão para requisições com JSON
    'Content-Type': 'application/json',
  },
  // Tempo limite de 10 segundos
  timeout: 10000,
})

// Interceptor para adicionar o token de autenticação em todas as requisições
api.interceptors.request.use((config) => {
  // Pega o token do localStorage, onde ele será salvo após o login
  const token = localStorage.getItem('qualifica_saude_token') 
  
  if (token) {
    // Adiciona o token no header de Autorização
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

export default api