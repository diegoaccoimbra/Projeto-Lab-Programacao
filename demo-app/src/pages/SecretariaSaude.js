import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { importFila, exportFilaFinal, fetchFilaFinal } from '../services/solicitacoesServicos' 

// Exibe a fila final em forma de tabela por meio das props recebidas
const FilaFinalQualificadaTabela = ({ filaFinal, loading, error }) => {
    // Mengagens exibidas para o usuário    
    if (loading) {
        return <div className = "loading-message">Carregando fila final...</div>
    }
    if (error) {
        return <div className = "error-message">Erro: {error}</div>
    }
    if (filaFinal.length === 0) {
        return <div>Não há pacientes na fila final.</div>
    }

    return (
        <div className = "fila-final-container">
            <h3 className = "section-title">Pacientes aprovados ({filaFinal.length})</h3>
            
            <div className = "tabela-container">
                <table className = "fila-tabela">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Especialidade</th>
                            <th>CPF</th>
                            <th>Data Aprovação</th>
                            <th>Qualificado por</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filaFinal.map(paciente => (
                            <tr key={paciente.id}>
                                <td>{paciente.nome}</td>
                                <td>{paciente.especialidade}</td>
                                <td>{paciente.cpf}</td>
                                <td>{paciente.dataAprovacao}</td>
                                <td>{paciente.profissional}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

// Componente principal da secretaria
const SecretariaSaude = () => {
    // Verifica a sessão e o logout do sistema
    const { user, logout } = useAuth()
    
    // Estados da fila final na tabela
    const [filaFinal, setFilaFinal] = useState([])
    const [loadingFila, setLoadingFila] = useState(false)
    const [errorFila, setErrorFila] = useState(null)
    
    // Estados da funcionalidade de importar uma fila em CSV ou XLSX
    const [importFile, setImportFile] = useState(null)
    const [importMsg, setImportMsg] = useState('')
    const [isImporting, setIsImporting] = useState(false)
    
    // Estados da funcionalidade de exportação da fila
    const [exportMsg, setExportMsg] = useState('')
    const [isExporting, setIsExporting] = useState(false)
    const [exportFormat, setExportFormat] = useState('csv')
    
    // Função pra carregar a fila final
    const loadFila = async () => {
        setLoadingFila(true)
        setErrorFila(null)
        try {
            // Chama a função no serviço solicitacoesServicos.js pra atualizar os dados
            const data = await fetchFilaFinal()
            setFilaFinal(data)
        } 
        catch (err) {
            setErrorFila('Erro ao carregar a fila final!')
        } 
        finally {
            setLoadingFila(false)
        }
    }
    
    // Carrega a fila final uma vez ao carregar a página
    useEffect(() => {
        loadFila()
    }, [])
    
    // Somente usuários com o perfil "secretaria" podem acessar
    if (!user || user.perfil.toLowerCase() !== 'secretaria') {
        return <div>O seu perfil não tem permissão para essa página.</div>
    }

    // Função para importação
    const handleImport = async () => {
        if (!importFile) {
            setImportMsg('Selecione um arquivo para importar.')
            return
        }

        setIsImporting(true)
        setImportMsg('Importando...')

        try {
            // Chama a função do serviço solicitacoesServicos.js para importar a fila
            const result = await importFila(importFile) 
            // Mensagens para o usuário
            setImportMsg(`✅ Sucesso! ${result.total_importados} pacientes foram importados.`)
            setImportFile(null)
            // Opcional: Recarregar a lista após a importação, se a fila final mudar
            // loadFila()
        } 
        catch (error) {
            const msg = error.response?.data?.message
            setImportMsg(`❌ Erro ao importar: ${msg}`)
        } 
        finally {
            setIsImporting(false)
        }
    }

    // Função para exportação
    const handleExport = async () => {
        setIsExporting(true)
        setExportMsg(`Exportando...`)

        try {
            // Chamando a função do serviço para exportar
            const response = await exportFilaFinal(exportFormat) 
            
            // Criando um objeto de arquivo por meio dos dados recebidos do arquivo blob
            const url = window.URL.createObjectURL(new Blob([response.data]))
            
            // Simulando um clique de download
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `fila_qualificada_${new Date().toISOString().slice(0, 10)}.${exportFormat}`)

            // Inicia o download e depois limpa o objeto
            document.body.appendChild(link)
            link.click()
            // Limpando
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
            
            setExportMsg(`✅ Fila final exportada com sucesso!`)
        } 
        catch (error) {
            const msg = error.response?.data?.message
            setExportMsg(`❌ Erro ao exportar: ${msg}`)
        } 
        finally {
            setIsExporting(false)
        }
    }


    return (
        <div className = "secretaria-page-container">
            <header>
                <h1>Gestão da fila - Secretaria</h1>
                <button onClick = {logout} className = "logout-button">Sair</button>
            </header>
            
            <div className = "importar-container">
                <h2>Importar Nova Fila</h2>
                <p>Faça o upload do arquivo CSV ou XLSX para iniciar o ciclo de qualificação.</p>
                
                <div className = "input-group">
                    <input type = "file" accept = ".csv, .xlsx" onChange = {(e) => {
                            setImportFile(e.target.files[0])
                            setImportMsg('')
                        }}
                        disabled = {isImporting}
                    />
                    <button onClick = {handleImport} disabled = {!importFile || isImporting}>
                        {isImporting ? 'Processando...' : 'Importar Lista'}
                    </button>
                </div>
                {importMsg && <p className = {`status-message ${importMsg.startsWith('✅') ? 'success' : 'error'}`}>{importMsg}</p>}
            </div>
            
            <hr/>

            <section className = "visualizacao-section">
                <div className = "visualizacao-header">
                    <h2>Visualização da fila final</h2>
                    <button onClick = {loadFila} disabled={loadingFila} className = "secondary-button refresh-button">
                        {loadingFila ? 'Atualizando...' : 'Atualizar lista'}
                    </button>
                </div>
                
                <FilaFinalQualificadaTabela filaFinal={filaFinal} loading={loadingFila} error={errorFila}/>
            </section>
            
            <hr/>
            
            <div className = "exportar-container">
                <h2>Exportar fila qualificada</h2>
                <p>Selecione o formato que você deseja exportar a fila.</p>
                
                <div className = "input-group">
                    <select className = "select-format" value = {exportFormat} onChange = {(e) => setExportFormat(e.target.value)} disabled = {isExporting}>
                        <option value = "csv">CSV</option>
                        <option value = "xlsx">XLSX</option>
                    </select>
                    
                    <button onClick = {handleExport} disabled = {isExporting}>
                        {isExporting ? 'Exportando o arquivo...' : `Exportar como ${exportFormat.toUpperCase()}`}
                    </button>
                </div>
                {exportMsg && <p className={`status-message ${exportMsg.startsWith('✅') ? 'success' : 'error'}`}>{exportMsg}</p>}
            </div>
        </div>
    )
}

export default SecretariaSaude