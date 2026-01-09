import axios from 'axios'

// URL base da API
const API_BASE_URL = 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

// Interceptor de requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('qualifica_saude_token') 
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Se os dados forem FormData (upload de arquivo), deixamos o navegador definir o Content-Type. Caso seja um objeto comum, definimos como JSON.
  if (config.data instanceof FormData) {
      delete config.headers['Content-Type']; 
  } else {
      config.headers['Content-Type'] = 'application/json';
  }

  return config
}, (error) => {
  return Promise.reject(error)
})

export default api