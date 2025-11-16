// src/components/FiltroFila.jsx

import React, { useState } from 'react';

const STATUS_OPTIONS = ['Todos', 'Pendente', 'Aprovada', 'Não Aprovada'];
const ESPECIALIDADE_OPTIONS = ['Todas', 'Cardiologia', 'Neurologia', 'Psicologia', 'Ortopedia'];

/**
 * Componente de interface para os filtros de fila (RF6).
 * @param {function} onFilterChange - Função de callback para passar os filtros ao componente pai.
 */
const FiltroFila = ({ onFilterChange }) => {
  const [status, setStatus] = useState('Todos');
  const [especialidade, setEspecialidade] = useState('Todas');

  // Função para disparar a atualização dos filtros
  const handleApplyFilters = (newStatus = status, newEspecialidade = especialidade) => {
    onFilterChange({ status: newStatus, especialidade: newEspecialidade });
  };

  // Funções de mudança de estado
  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    handleApplyFilters(newStatus, especialidade); // Aplica o filtro imediatamente
  };

  const handleEspecialidadeChange = (e) => {
    const newEspecialidade = e.target.value;
    setEspecialidade(newEspecialidade);
    handleApplyFilters(status, newEspecialidade); // Aplica o filtro imediatamente
  };

  return (
    <div className="filtros-container" style={{ display: 'flex', gap: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px', marginBottom: '20px' }}>
      
      {/* Filtro por Status */}
      <div>
        <label htmlFor="status-filter" style={{ fontWeight: 'bold' }}>Filtrar por Status:</label>
        <select id="status-filter" value={status} onChange={handleStatusChange} style={{ marginLeft: '10px', padding: '5px' }}>
          {STATUS_OPTIONS.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Filtro por Especialidade */}
      <div>
        <label htmlFor="especialidade-filter" style={{ fontWeight: 'bold' }}>Filtrar por Especialidade:</label>
        <select id="especialidade-filter" value={especialidade} onChange={handleEspecialidadeChange} style={{ marginLeft: '10px', padding: '5px' }}>
          {ESPECIALIDADE_OPTIONS.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
      
    </div>
  );
};

export default FiltroFila;