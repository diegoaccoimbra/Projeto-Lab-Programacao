import api from './api'

// Busca os dados da solicitação e documentos necessários do paciente logado
export const fetchSolicitacaoDoPaciente = async (idPaciente) => {
  const response = await api.get('/paciente/minha-solicitacao')
  return response.data
}

// Envia um documento para a solicitação
export const uploadDocumento = async (idSolicitacao, idDocumento, arquivo) => {
  const formData = new FormData()
  formData.append('documento', arquivo)
  
  // Rota para upload
  const response = await api.post(`/paciente/solicitacoes/${idSolicitacao}/documentos/${idDocumento}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data', },
  })
  
  return response.data
}

// Cadastra novo paciente
export const cadastrarPaciente = async (dados) => {
    const response = await api.post('/paciente/cadastro', dados)
    return response.data
}

// Visualiza as solicitações já feitas
export const fetchMinhasSolicitacoes = async () => {
    const response = await api.get('/paciente/minhas-solicitacoes')
    return response.data
}

// Cria uma nova solicitação
export const criarSolicitacao = async (formData) => {
    const response = await api.post('/solicitacoes', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    return response.data
}