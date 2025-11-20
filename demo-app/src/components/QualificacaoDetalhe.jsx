import React, { useState, useEffect } from 'react'
import { fetchDetalheSolicitacao, qualificarSolicitacao } from '../services/profissionalServicos'

// Array que lista o status de qualificação de uma solicitação
const STATUS_QUALIFICACAO = ['Aprovada', 'Não Aprovada']

// Componente que recebe 3 props do componente pai PainelProfissionalSaude.js: o id da solicitação, uma função pra fechar a tela de detalhe da solicitação e uma função de callback para atualizar a fila após a qualificação
const QualificacaoDetalhe = ({ solicitacaoId, onClose, onQualifySuccess }) => {
  const [detalhe, setDetalhe] = useState(null) // Detalhe da solicitação
  const [loading, setLoading] = useState(true) // Carregamento da tela de detalhes
  const [loadingQualificacao, setLoadingQualificacao] = useState(false) // Estado de envio da decisão (pra desabilitar o botão)
  const [statusDecisao, setStatusDecisao] = useState('') // Decisão "aprovada" ou "não aprovada"
  const [justificativa, setJustificativa] = useState('') // Texto da justificativa
  const [message, setMessage] = useState('') // Mensagens para o usuário

  // Carrega os detalhes da solicitação e os documentos
  useEffect(() => {
    const loadDetalhes = async () => {
      setLoading(true)
      try {
        // Chama função axios pra buscar os dados no back-end
        const data = await fetchDetalheSolicitacao(solicitacaoId)
        setDetalhe(data)
        // Define o status inicial como o status atual
        setStatusDecisao(data.status) 
      }
      catch (error) {
        setMessage('Erro ao carregar os detalhes da solicitação.')
      }
      finally {
        setLoading(false)
      }
    }
    loadDetalhes()
  }, [solicitacaoId])


  // Função para submeter a qualificação
  const handleQualificar = async () => {
    // Verifica se um status foi definido
    if (!statusDecisao) {
      setMessage('Selecione um status de qualificação.')
      return
    }

    // Exibe mensagem de justificativa para caso a solicitação não tenha sido qualificada
    if (statusDecisao === 'Não Aprovada' && justificativa.trim() === '') {
      setMessage('A justificativa é obrigatória para reprovação.')
      return
    }

    // Mensagem exibida logo após submeter a qualificação
    setLoadingQualificacao(true)
    setMessage('Salvando qualificação...')


    try {
      // Chama a função axios para enviar o status e a justificativa para o back-end
      const result = await qualificarSolicitacao(solicitacaoId, statusDecisao, justificativa)
      setMessage(result.mensagem)
      
      // Notifica o pai PainelProfissionalSaude.js para atualizar a fila
      onQualifySuccess(solicitacaoId, result.newStatus) 
      // Fecha após 1.5s
      setTimeout(onClose, 1500)
      
    } 
    catch (error) {
      setMessage(`Erro: ${error.message || 'Falha ao qualificar.'}`)
    } 
    finally {
      setLoadingQualificacao(false)
    }
  }


  // A interface só exibida após os dados serem carregados
  if (loading) {
    return <div>Carregando detalhes do paciente...</div>
  }
  if (!detalhe) {
    return <div>Os detalhes não foram encontrados.</div>
  }

  // Container de detalhe da solicitação
  return (
    <div className = "qualificacao-detalhe-container">
      
      <button className = 'qualificacao-fechar-button' onClick = {onClose}>X</button>
      <h2>Detalhe da solicitação ID: {detalhe.id}</h2>
      <h3>Paciente: {detalhe.paciente} | Especialidade: {detalhe.especialidade}</h3>
      
      <div className = 'documentos-anexados-container'>
        <h4>Documentos anexados para análise</h4>
        <div>
          {detalhe.documentos.map((doc, index) => (
            <div className = 'documentos-anexados-div' key={index}>
              {doc.nome}
              <p style = {{ color: doc.status === 'OK' ? 'green' : 'red' }}>Status: {doc.status}</p>
              <a href = {doc.link} target = "_blank">Visualizar Documento</a>
            </div>
          ))}
        </div>
      </div>

      <div className = "modulo-qualificacao">
        <h4>Decisão de Qualificação</h4>
        <div className = 'status-solicitao-div'>
          <label>Status da Solicitação:</label>
          <select className = 'status-solicitacao-select' value={statusDecisao} onChange={(e) => {
            setStatusDecisao(e.target.value)
            setMessage('')
          }} disabled = {loadingQualificacao}>
            {STATUS_QUALIFICACAO.map(status => (
              <option key = {status} value = {status}>{status}</option>
            ))}
          </select>
        </div>
        
        {statusDecisao === 'Não Aprovada' && (
          <div>
            <label>Justificativa de Reprovação:</label>
            <textarea
              value = {justificativa}
              onChange = {(e) => setJustificativa(e.target.value)}
              placeholder = "Digite aqui a justificativa."
              disabled = {loadingQualificacao}
            />
          </div>
        )}
        
        <button onClick = {handleQualificar} disabled = {loadingQualificacao}>
          {loadingQualificacao ? 'Processando...' : `Confirmar Qualificação`}
        </button>
        <p>{message}</p>
      </div>

    </div>
  )
}

export default QualificacaoDetalhe