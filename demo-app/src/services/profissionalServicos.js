import api from './api'

// Procura a fila de pacientes para qualificação
export const fetchFilaQualificacao = async (filtros) => {
  // Envia os filtros como parâmetros de query string: /profissional/fila?status=Pendente&especialidade=Cardiologia
  const response = await api.get('/profissional/fila', { params: filtros })
  return response.data
}

// Procura os detalhes completos de uma solicitação
export const fetchDetalheSolicitacao = async (idSolicitacao) => {
  const response = await api.get(`/profissional/solicitacoes/${idSolicitacao}`)
  return response.data
}

// Envia a qualificação (aprovada ou não aprovada) junto com a justificativa
export const qualificarSolicitacao = async (idSolicitacao, status, justificativa) => {
  const response = await api.put(`/profissional/solicitacoes/${idSolicitacao}/qualificar`, {
    status,
    justificativa,
  })
  return response.data
}