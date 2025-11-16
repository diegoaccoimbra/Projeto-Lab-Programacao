import api from './services'
import axios from 'axios'

// Faz o login buscando o token e os dados do usuário
export const login = async (credenciais) => {
  try {
    const response = await api.post('/auth/login', credenciais)
    
    // Retorno do back-end
    const { token, user } = response.data

    // Salva o token e o usuário no localStorage
    localStorage.setItem('qualifica_saude_token', token)
    localStorage.setItem('qualifica_saude_user', JSON.stringify(user))

    return user

  }
  catch (error) {
    if (axios.isAxiosError(error)) {
        // Se for erro de rede/CORS ou erro HTTP, lança o erro
        const errorMessage = error.response?.data?.message || error.message
        throw new Error(errorMessage)
    }
    throw error
  }
}

// Faz o logout
export const logout = () => {
  localStorage.removeItem('qualifica_saude_token')
  localStorage.removeItem('qualifica_saude_user')
}

// Serviço de importação da fila
export const importFila = async (file) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post('/secretaria/importar', formData, {
    headers: { 'Content-Type': 'multipart/form-data', },
  })
  
  return response.data
}

// Serviço de exportação da fila final
export const exportFilaFinal = async (format) => {
  // A requisição GET retorna um blob (o arquivo)
  const response = await api.get(`/secretaria/exportar?format=${format}`, {
    // Recebe a resposta como um arquivo binário
    responseType: 'blob',
  })

  return response
}

// Realiza a busca de pacientes qualificados para a fila final
export const fetchFilaFinal = async () => {
  const response = await api.get('/secretaria/fila-final')
  
  return response.data 
}