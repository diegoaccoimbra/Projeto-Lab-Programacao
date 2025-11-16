// src/components/QualificacaoDetalhe.jsx

import React, { useState, useEffect } from 'react';
import { fetchDetalheSolicitacao, qualificarSolicitacao } from '../api/profissionalServicos';

const STATUS_QUALIFICACAO = ['Aprovada', 'Não Aprovada'];

/**
 * Módulo de Análise e Qualificação (RF3).
 * @param {number} solicitacaoId - ID da solicitação a ser analisada.
 * @param {function} onClose - Função para fechar o modal/tela de detalhe.
 * @param {function} onQualifySuccess - Callback para atualizar a fila após a qualificação.
 */
const QualificacaoDetalhe = ({ solicitacaoId, onClose, onQualifySuccess }) => {
  const [detalhe, setDetalhe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingQualificacao, setLoadingQualificacao] = useState(false);
  const [statusDecisao, setStatusDecisao] = useState('');
  const [justificativa, setJustificativa] = useState('');
  const [message, setMessage] = useState('');

  // 1. Carrega os detalhes da solicitação e os documentos
  useEffect(() => {
    const loadDetalhes = async () => {
      setLoading(true);
      try {
        const data = await fetchDetalheSolicitacao(solicitacaoId);
        setDetalhe(data);
        setStatusDecisao(data.status); // Define o status inicial como o status atual
      } catch (error) {
        setMessage('Erro ao carregar detalhes da solicitação.');
      } finally {
        setLoading(false);
      }
    };
    loadDetalhes();
  }, [solicitacaoId]);


  // 2. Lógica para submeter a qualificação
  const handleQualificar = async () => {
    if (!statusDecisao) {
      setMessage('Selecione um status de qualificação.');
      return;
    }

    if (statusDecisao === 'Não Aprovada' && justificativa.trim() === '') {
      setMessage('🚨 A justificativa é obrigatória para reprovação.');
      return;
    }

    setLoadingQualificacao(true);
    setMessage('⏳ Salvando qualificação...');

    try {
      const result = await qualificarSolicitacao(solicitacaoId, statusDecisao, justificativa);
      setMessage(result.mensagem);
      
      // Notifica o pai para atualizar a fila e fecha
      onQualifySuccess(solicitacaoId, result.newStatus); 
      setTimeout(onClose, 1500); // Fecha após 1.5s
      
    } catch (error) {
      setMessage(`❌ Erro: ${error.message || 'Falha ao qualificar.'}`);
    } finally {
      setLoadingQualificacao(false);
    }
  };


  if (loading) return <div>Carregando detalhes do paciente...</div>;
  if (!detalhe) return <div>Detalhes não encontrados.</div>;

  return (
    <div className="qualificacao-detalhe-container" style={{ padding: '20px', border: '2px solid #007bff', borderRadius: '8px', maxWidth: '800px', margin: '20px auto' }}>
      
      <button onClick={onClose} style={{ float: 'right' }}>X Fechar</button>
      <h2>🔎 Análise de Solicitação ID: {detalhe.id}</h2>
      <h3>Paciente: **{detalhe.paciente}** | Especialidade: **{detalhe.especialidade}**</h3>
      
      {/* Seção de Documentos (RF3) */}
      <div style={{ margin: '20px 0', borderTop: '1px solid #ccc', paddingTop: '15px' }}>
        <h4>📎 Documentos Anexados para Análise</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
          {detalhe.documentos.map((doc, index) => (
            <div key={index} style={{ border: '1px dashed #007bff', padding: '10px', backgroundColor: '#f9f9f9' }}>
              **{doc.nome}**
              <p style={{ color: doc.status === 'OK' ? 'green' : 'red' }}>Status (Simulado): {doc.status}</p>
              {/* No mundo real, aqui seria um link para visualização ou um modal viewer */}
              <a href={doc.link} target="_blank" rel="noopener noreferrer">Visualizar Documento</a>
            </div>
          ))}
        </div>
      </div>
      
      <hr />

      {/* Seção de Qualificação (RF3) */}
      <div className="modulo-qualificacao">
        <h4>✅ Decisão de Qualificação</h4>
        
        {/* Campo de Status */}
        <div style={{ marginBottom: '10px' }}>
          <label style={{ fontWeight: 'bold', display: 'block' }}>Status da Solicitação:</label>
          <select value={statusDecisao} onChange={(e) => {
            setStatusDecisao(e.target.value);
            setMessage('');
          }} disabled={loadingQualificacao}>
            {STATUS_QUALIFICACAO.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        
        {/* Campo de Justificativa (RF3: Obrigatório se Não Aprovada) */}
        {statusDecisao === 'Não Aprovada' && (
          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontWeight: 'bold', display: 'block' }}>Justificativa de Reprovação:</label>
            <textarea
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              placeholder="Ex: Documento ilegível, Exame desatualizado."
              rows="3"
              style={{ width: '100%', padding: '5px' }}
              disabled={loadingQualificacao}
            />
          </div>
        )}
        
        <button onClick={handleQualificar} disabled={loadingQualificacao}>
          {loadingQualificacao ? 'Processando...' : `Confirmar Qualificação: ${statusDecisao || '...'}`}
        </button>
        {message && <p style={{ marginTop: '10px', color: message.startsWith('❌') ? 'red' : 'green' }}>{message}</p>}
      </div>

    </div>
  );
};

export default QualificacaoDetalhe;