import React, { useState } from 'react'

// Opções de filtro de status e especialidade para o painel
const STATUS_OPTIONS = ['Todos', 'Aprovada', 'Não Aprovada', 'Pendente']
const ESPECIALIDADE_OPTIONS = ['Todas', 'Cardiologia', 'Neurologia', 'Psicologia', 'Ortopedia']

// Componente que recebe uma função de callback para passar os filtros pro componente pai
const FiltroFila = ({ onFilterChange }) => {
  const [status, setStatus] = useState('Todos')
  const [especialidade, setEspecialidade] = useState('Todas')

  // Função para a atualização dos filtros com os valores atuais sendo enviados para o componente pai
  const handleApplyFilters = (newStatus = status, newEspecialidade = especialidade) => {
    onFilterChange({ status: newStatus, especialidade: newEspecialidade })
  }

  // Funções de mudança de estado com base no que o usuário seleciona em "status" e "especialidade"
  const handleStatusChange = (e) => {
    const newStatus = e.target.value
    setStatus(newStatus)
    // Notifica o componente pai sobre a mudança de filtro
    handleApplyFilters(newStatus, especialidade)
  }

  const handleEspecialidadeChange = (e) => {
    const newEspecialidade = e.target.value
    setEspecialidade(newEspecialidade)
    handleApplyFilters(status, newEspecialidade)
  }

  // Container dos filtros, que reage a cada mudança do usuário e mapeia as opção nos arrays definidos anteriormente
  return (
    <div className = "filtros-container">
      <div>
        <label htmlFor = "status-filter">Filtrar por Status:</label>
        <select id = "status-filter" value = {status} onChange = {handleStatusChange}>
          {STATUS_OPTIONS.map(opt => (
            <option key = {opt} value = {opt}>{opt}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor = "especialidade-filter">Filtrar por Especialidade:</label>
        <select id = "especialidade-filter" value = {especialidade} onChange = {handleEspecialidadeChange}>
          {ESPECIALIDADE_OPTIONS.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
      
    </div>
  )
}

export default FiltroFila