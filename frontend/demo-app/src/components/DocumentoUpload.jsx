import React, { useState } from 'react'
import { uploadDocumento } from '../services/pacienteServicos'

// Componente qu gerencia o upload. Recebe duas props (o objeto de documento a ser enviado e uma função de retorno de chamada para notificar a página principal)
const DocumentoUpload = ({ doc, onUploadSuccess }) => {
  // Hooks pra armazenar o documento enviado, status do documento, status do envio e mensagens de instrução do envio para o usuário
  const [selectedFile, setSelectedFile] = useState(null)
  const [status, setStatus] = useState(doc.statusUpload)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState('')

  // Função pra salvar o arquivo selecionado pelo usuário em "selectedFile"
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0])
    setUploadMessage('')
  }

  // Função disparada quando o usuário clica no botão para enviar o documento
  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadMessage('Selecione um arquivo.')
      return
    }

    // Exibe uma mensagem de que o arquivo está sendo enviado
    setIsUploading(true)
    setUploadMessage('Enviando...')

    try {
      // MUDAR DEPOIS (o id da solicitação deve vir do componente pai (PortalPaciente)
      const idSolicitacao = 123 
      
      // Chama a função do serviço para enviar o arquivo
      const result = await uploadDocumento(idSolicitacao, doc.id, selectedFile)
      
      // Atualiza as mensagens
      setUploadMessage(result.message)
      setStatus('Enviado')
      // Notifica o componente pai para ser atualizado
      onUploadSuccess(doc.id, 'Enviado')
      // Limpa a seleção
      setSelectedFile(null)
      
    } catch (error) {
      setUploadMessage('Falha no envio.')
      console.error("Erro ao subir documento:", error)
      setStatus(doc.statusUpload)
    } finally {
      setIsUploading(false)
    }
  }

  // Cor do texto e borda é verde caso o documento seja enviado
  const statusColor = status === 'Enviado' ? 'green' : 'orange'
  
  return (
    // Container do documento. Exibe o campo de enviar o arquivo somente se ele não tiver sido enviado
    <div className="documento-item" style = {{ border: `1px solid ${statusColor}`}}>
      <h4>{doc.nome} ({doc.tipo})</h4>
      <p style = {{ color: statusColor }}>Status: {status}</p>
      
      {status !== 'Enviado' && (
        <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
          <input 
            type = "file" 
            accept = ".pdf, image/*"
            onChange = {handleFileChange} 
            disabled = {isUploading}
          />
          <button 
            onClick = {handleUpload} 
            disabled = {isUploading || !selectedFile}
          >
            {isUploading ? 'Processando...' : 'Enviar Documento'}
          </button>
        </div>
      )}
      {uploadMessage && <p style={{ fontSize: '0.9em' }}>* {uploadMessage}</p>}
    </div>
  )
}

export default DocumentoUpload