import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchFilaQualificacao } from '../services/profissionalServicos';
import FiltroFila from '../components/FiltroFila';
import QualificacaoDetalhe from '../components/QualificacaoDetalhe';

const PainelProfissionalSaude = () => {
  const { user, logout } = useAuth();
  const [fila, setFila] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({ status: 'Pendente', especialidade: 'Todas' });
  const [selectedSolicitacaoId, setSelectedSolicitacaoId] = useState(null);

  const loadFila = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchFilaQualificacao(filtros);
      setFila(data);
    } catch (error) {
      console.error("Erro ao carregar a fila!", error);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    loadFila();
  }, [loadFila]);

  const handleFilterChange = (newFilters) => {
    setFiltros(newFilters);
  };

  const handleQualifySuccess = (id, newStatus) => {
    setFila(prevFila => prevFila.map(p => 
      p.id === id ? { ...p, status: newStatus } : p
    ));
    setSelectedSolicitacaoId(null); // Fecha o detalhe após qualificar
    if (filtros.status !== 'Todos') {
        loadFila();
    }
  };

  if (!user || user.perfil.toLowerCase() !== 'profissional') {
    return <div className="p-4">O seu perfil não tem permissão para essa página.</div>;
  }
  
  // CORREÇÃO VISUAL: Se houver ID selecionada, renderizamos o componente de Detalhe
  if (selectedSolicitacaoId !== null) {
    return (
      <div className="portal-paciente-container"> 
        <QualificacaoDetalhe 
          solicitacaoId={selectedSolicitacaoId} 
          onClose={() => setSelectedSolicitacaoId(null)}
          onQualifySuccess={handleQualifySuccess}
        />
      </div>
    );
  }

  return (
    <div className="painel-profissional-container">
      <header className="portal-header">
        <h1>Painel de Qualificação</h1>
        <button onClick={logout} className="logout-button">Sair</button>
      </header>

      <h2>Fila de Pacientes para Análise</h2>

      <FiltroFila onFilterChange={handleFilterChange} />
      
      {loading && <div className="status-message">Carregando a fila...</div>}
      {!loading && fila.length === 0 && <div className="status-message">Nenhum paciente encontrado.</div>}

      {!loading && fila.length > 0 && (
        <table className="fila-tabela">
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
              <tr key={paciente.id}>
                <td>{paciente.id}</td>
                <td>{paciente.nome} <br/><small>{paciente.cpf}</small></td>
                <td>{paciente.especialidade}</td>
                <td>{paciente.documentosAnexados}</td>
                <td>
                  <span className={`status-badge status-${paciente.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {paciente.status}
                  </span>
                </td>
                <td>
                  <button 
                    className="qualificar-button" 
                    onClick={() => setSelectedSolicitacaoId(paciente.id)}
                    /* A cor agora é controlada pela classe, mas mantemos o texto dinâmico */
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
  );
};

export default PainelProfissionalSaude;