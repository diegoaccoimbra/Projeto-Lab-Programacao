import api from './api'

// Busca os dados da solicitação e histórico
export const fetchMinhasSolicitacoes = async () => {
  const response = await api.get('/paciente/minhas-solicitacoes')
  return response.data
}

// Cria uma nova solicitação com upload
export const criarSolicitacao = async (formData) => {
    const response = await api.post('/paciente/nova-solicitacao', formData)
    return response.data
}

// Cadastra novo paciente
export const cadastrarPaciente = async (dados) => {
    const response = await api.post('/paciente/cadastro', dados)
    return response.data
}

// Envia um documento
export const uploadDocumento = async (idSolicitacao, idDocumento, arquivo) => {
  const formData = new FormData()
  formData.append('documento', arquivo)
  
  const response = await api.post(`/paciente/solicitacoes/${idSolicitacao}/documentos/${idDocumento}`, formData)
  return response.data
}