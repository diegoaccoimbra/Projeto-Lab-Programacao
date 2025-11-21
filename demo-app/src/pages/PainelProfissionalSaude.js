import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchFilaQualificacao } from '../services/profissionalServicos'
import FiltroFila from '../components/FiltroFila'
import QualificacaoDetalhe from '../components/QualificacaoDetalhe'

const PainelProfissionalSaude = () => {
  const { user, logout } = useAuth()
  // Lista de pacientes retornada pelo back-end
  const [fila, setFila] = useState([])
  // Estado de carregamento da lista
  const [loading, setLoading] = useState(true)
  // Estado dos filtros
  const [filtros, setFiltros] = useState({ status: 'Pendente', especialidade: 'Todas' })
  // Estado da tela de detalhe da solicitação
  const [selectedSolicitacaoId, setSelectedSolicitacaoId] = useState(null)


  // Função que exibe a lista com os filtros atuais aplicados. Só é recriada se o estado dos filtros mudar por causa do useCallback
  const loadFila = useCallback(async () => {
    setLoading(true)
    try {
      // Chama a função de serviço com os filtros atuais
      const data = await fetchFilaQualificacao(filtros)
      setFila(data)
    } 
    catch (error) {
      console.error("Erro ao carregar a fila!", error)
    } 
    finally {
      setLoading(false)
    }
    // Renderiza sempre que os filtros são alterados
  }, [filtros]) 

  // Executando "loadFila" a cada mudança de filtro
  useEffect(() => {
    loadFila()
  }, [loadFila])

  // Função para a mudança de filtros. Vai ser passada como prop para o componente "FiltroFila"
  const handleFilterChange = (newFilters) => {
    setFiltros(newFilters)
  }

  // Função para o sucesso da qualificação no componente "QualificacaoDetalhe"
  const handleQualifySuccess = (id, newStatus) => {
    // Atualiza o status do paciente na tabela sem precisar carregar todaa lista
    setFila(prevFila => prevFila.map(p => 
      p.id === id ? { ...p, status: newStatus } : p
    ))
    // Recarregando a fila para o paciente que foi qualificado sumir da lista visualizada
    if (filtros.status !== 'Todos') {
        loadFila()
    }
  }

  // Somente usuários com o perfil "profissional" podem acessar
  if (!user || user.perfil.toLowerCase() !== 'profissional') {
    return <div>O seu perfil não tem permissão para essa página.</div>
  }
  
  // Exibe a tela de detalhe caso uma solicitação seja selecionada
  if (selectedSolicitacaoId) {
    return (
      <QualificacaoDetalhe 
        solicitacaoId = {selectedSolicitacaoId} 
        onClose = {() => setSelectedSolicitacaoId(null)}
        onQualifySuccess = {handleQualifySuccess}
      />
    )
  }

  // Painel de qualificação
  return (
    <div className = "painel-profissional-container">
      <header>
        <h1>Painel de Qualificação</h1>
        <button onClick = {logout}>Sair</button>
      </header>

      <h2>Fila de Pacientes para Análise</h2>

      <FiltroFila onFilterChange={handleFilterChange} />
      
      {loading && <div>Carregando a fila...</div>}
      {!loading && fila.length === 0 && <div>Nenhum paciente foi encontrado com estes filtros.</div>}

      {!loading && fila.length > 0 && (
        <table className = "fila-tabela" style = {{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Especialidade</th>
              <th>Documentos</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {fila.map((paciente) => (
              <tr key = {paciente.id}>
                <td>{paciente.id}</td>
                <td>{paciente.nome} ({paciente.cpf})</td>
                <td>{paciente.especialidade}</td>
                <td>{paciente.documentosAnexados}</td>
                <td><span className = {`status-${paciente.status.toLowerCase().replace(' ', '-')}`}>{paciente.status}</span></td>
                <td>
                  <button className='qualificar-button' 
                    onClick = {() => setSelectedSolicitacaoId(paciente.id)}
                    style = {{ backgroundColor: paciente.status === 'Pendente' ? 'orange' : 'green'}}
                  >
                    {paciente.status === 'Pendente' ? 'Qualificar' : 'Visualizar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default PainelProfissionalSaude