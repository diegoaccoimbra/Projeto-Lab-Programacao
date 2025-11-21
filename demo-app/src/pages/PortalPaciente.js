import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchSolicitacaoDoPaciente } from '../services/pacienteServicos'
import DocumentoUpload from '../components/DocumentoUpload'

const PortalPaciente = () => {
  // Estados que armazenm os dados da solicitação, estado carregamento e erro
  const { user, logout } = useAuth()
  const [solicitacao, setSolicitacao] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Função para buscar os dados da solicitação. Só é recriada se o id do usuário mudar
  const loadSolicitacao = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Utiliza o ID do usuário logado para buscar a solicitação
      const data = await fetchSolicitacaoDoPaciente(user.id) 
      setSolicitacao(data)
    } 
    catch (err) {
      setError('Erro ao carregar a solicitação!')
      console.error(err)
    } 
    finally {
      setLoading(false)
    }
  }, [user.id])

  // Hook pra chamar loadSolicitacao. Busca os dados somente uma vez
  useEffect(() => {
    loadSolicitacao()
  }, [loadSolicitacao])

  // Função de callback passada para o componente filho DocumentoUpload.jsx. Atualiza o status do documento atual quando ele é enviado com sucesso sem precisar recarregar todos os dados
  const handleUploadSuccess = (documentoId, newStatus) => {
    setSolicitacao(prevSol => ({
      ...prevSol, documentosNecessarios: prevSol.documentosNecessarios.map(doc => doc.id === documentoId ? { ...doc, statusUpload: newStatus } : doc)
    }))
  }

  // Somente usuários com o perfil "paciente" podem acessar
  if (!user || user.perfil.toLowerCase() !== 'paciente') {
    return <div>O seu perfil não tem permissão para essa página.</div>
  }
  // Exibe uma mensagem de carregando
  if (loading) {
    return <div>Carregando sua solicitação...</div>
  }
  if (error) {
    return <div>Erro: {error}</div>
  }
  // Mensagem de quando não há solicitação para o usuário
  if (!solicitacao) {
    return <div>Não há solicitações para este CPF/Cartão SUS.</div>
  }
  
  // Pegando o status pra poder estilizar o badge de acordo
  const statusBase = solicitacao.statusAtual.split(' ')[0].toLowerCase() 

  return (
    <div className = "portal-paciente-container">
      <header>
        <h1>Olá, {user.nome}!</h1>
        <p>Unidade de Saúde de Origem: {solicitacao.unidadeDeOrigem}</p>
        <button onClick = {logout}>Sair</button>
      </header>
      
      <h2>Solicitação para {solicitacao.especialidade}</h2>
      
      <div className = {`status-badge status-${statusBase}`}>
        Status Atual: {solicitacao.statusAtual}
      </div>

      <p>Motivo: {solicitacao.motivo}</p>
      
      <h3>Documentos obrigatórios para qualificação</h3>
      <p>Anexe os documentos solicitados abaixo. Arquivos aceitos: PDF ou Imagem.</p> 
      <div className = "upload-documentos-list">
        {solicitacao.documentosNecessarios.map((doc) => (
          <DocumentoUpload 
            key = {doc.id} 
            doc = {doc} 
            onUploadSuccess = {handleUploadSuccess} 
          />
        ))}
      </div>

      <h3>Histórico de Atualizações</h3>
      <ul className = "historico-lista">
        {solicitacao.historicoAtualizacoes.map((item, index) => (
          <li key = {index}>
            [{item.data}]: {item.status}
          </li>
        ))}
      </ul>

    </div>
  )
}

export default PortalPaciente