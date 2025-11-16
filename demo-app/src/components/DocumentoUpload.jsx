import React, { useState } from 'react';
import { uploadDocumento } from '../api/pacienteServicos';

/**
 * Componente para gerenciar o upload de um documento específico. (RF2)
 * @param {object} doc - O objeto de documento com id e nome.
 * @param {function} onUploadSuccess - Callback para atualizar o estado na página pai.
 */
const DocumentoUpload = ({ doc, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState(doc.statusUpload);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setUploadMessage('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadMessage('⚠️ Selecione um arquivo.');
      return;
    }

    setIsUploading(true);
    setUploadMessage('⏳ Enviando...');

    try {
      // O ID da solicitação viria do componente pai (PortalPaciente)
      const idSolicitacao = 123; 
      
      const result = await uploadDocumento(idSolicitacao, doc.id, selectedFile);
      
      setUploadMessage(result.message);
      setStatus('Enviado'); // Atualiza o status local
      onUploadSuccess(doc.id, 'Enviado'); // Notifica o componente pai
      setSelectedFile(null); // Limpa a seleção
      
    } catch (error) {
      setUploadMessage('❌ Falha no envio.');
      console.error("Erro ao subir documento:", error);
      setStatus(doc.statusUpload); // Retorna ao status original em caso de falha
    } finally {
      setIsUploading(false);
    }
  };

  const statusColor = status === 'Enviado' ? 'green' : 'orange';
  
  return (
    <div className="documento-item" style={{ border: `1px solid ${statusColor}`, padding: '10px', margin: '10px 0' }}>
      <h4>📄 {doc.nome} ({doc.tipo})</h4>
      <p style={{ color: statusColor }}>**Status:** {status}</p>
      
      {status !== 'Enviado' && (
        <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
          <input 
            type="file" 
            accept=".pdf, image/*" // Permite PDF e Imagens
            onChange={handleFileChange} 
            disabled={isUploading}
          />
          <button 
            onClick={handleUpload} 
            disabled={isUploading || !selectedFile}
          >
            {isUploading ? 'Processando...' : 'Enviar Documento'}
          </button>
        </div>
      )}
      {uploadMessage && <p style={{ fontSize: '0.9em' }}>* {uploadMessage}</p>}
    </div>
  );
};

export default DocumentoUpload;