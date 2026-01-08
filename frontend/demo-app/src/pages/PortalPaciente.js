import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchMinhasSolicitacoes, criarSolicitacao } from '../services/pacienteServicos'

// Mapeamento de documentos necessários por especialidade
const REQUISITOS_ESPECIALIDADE = {
    'Oftalmologia': ['Encaminhamento médico', 'Documento de Identidade'],
    'Cardiologia': ['Encaminhamento médico', 'Eletrocardiograma recente', 'Exames de sangue'],
    'Dermatologia': ['Encaminhamento médico', 'Fotos da região (opcional)'],
    'Neurologia': ['Encaminhamento médico', 'Tomografia ou Ressonância (se houver)', 'Relatório de sintomas'],
    'Psicologia': ['Encaminhamento da rede básica', 'Documento de Identidade', 'Cartão do SUS'],
    'Ortopedia': ['Encaminhamento médico', 'Raio-X recente', 'Laudo de exames de imagem'],
    'Padrao': ['Encaminhamento médico', 'Cartão do SUS']
}

const PortalPaciente = () => {
    const { user, logout } = useAuth()
    const [solicitacoes, setSolicitacoes] = useState([])
    const [loading, setLoading] = useState(true)
    const [abaAtiva, setAbaAtiva] = useState('lista') 
    
    // Estados para Nova Solicitação
    const [novaEspecialidade, setNovaEspecialidade] = useState('')
    const [novoMotivo, setNovoMotivo] = useState('')
    const [arquivos, setArquivos] = useState([])
    const [enviando, setEnviando] = useState(false)

    const loadSolicitacoes = useCallback(async () => {
        setLoading(true)
        try {
            const data = await fetchMinhasSolicitacoes()
            setSolicitacoes(data)
        } 
        catch (err) {
            console.error(err)
        } 
        finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { loadSolicitacoes() }, [loadSolicitacoes])

    const handleFileChange = (e) => {
        setArquivos([...e.target.files])
    }

    const handleNovaSolicitacao = async (e) => {
        e.preventDefault()
        setEnviando(true)
        
        // Simulação de FormData para upload de arquivos
        const formData = new FormData()
        formData.append('especialidade', novaEspecialidade)
        formData.append('motivo', novoMotivo)
        arquivos.forEach(file => formData.append('arquivos', file))

        try {
            await criarSolicitacao(formData)
            setNovaEspecialidade('')
            setNovoMotivo('')
            setArquivos([])
            setAbaAtiva('lista')
            loadSolicitacoes()
            alert('Solicitação e documentos enviados com sucesso!')
        } 
        catch (err) {
            alert('Erro ao criar solicitação.')
        } 
        finally {
            setEnviando(false)
        }
    }

    return (
        <div className = "portal-paciente-container">
            <header className = "portal-header">
                <h1>Olá, {user.nome}!</h1>
                <button onClick = {logout} className = "logout-button">Sair</button>
            </header>

            <nav className = "portal-nav">
                <button onClick = {() => setAbaAtiva('lista')} className = {abaAtiva === 'lista' ? 'nav-button active' : 'nav-button'}>
                    Minhas Solicitações
                </button>
                <button onClick = {() => setAbaAtiva('nova')} className = {abaAtiva === 'nova' ? 'nav-button active' : 'nav-button'}>
                    + Nova Solicitação
                </button>
            </nav>

            {abaAtiva === 'lista' ? (
                <section className = "portal-section">
                    <h2>Histórico de solicitações</h2>
                    {solicitacoes.map((sol) => (
                        <div key = {sol.id} className = "solicitacao-card">
                            <div className = "solicitacao-card-header">
                                <strong>{sol.especialidade}</strong>
                                <span className = {`status-badge status-${sol.statusAtual.toLowerCase().replace(' ', '-')}`}>
                                    {sol.statusAtual}
                                </span>
                            </div>
                            <p className = "solicitacao-data">Data: {sol.data}</p>
                            
                            {/* Histórico de Atualizações */}
                            <div className = "historico-atualizacoes">
                                <small><strong>Histórico:</strong></small>
                                <ul>
                                    {sol.historico?.map((h, i) => (
                                        <li key = {i}>{h.data}: {h.mensagem}</li>
                                    )) || <li>Solicitação recebida pelo sistema.</li>}
                                </ul>
                            </div>
                        </div>
                    ))}
                </section>
            ) : (
                <section className = "portal-section">
                    <h2>Nova Solicitação</h2>
                    <form onSubmit = {handleNovaSolicitacao} className = "portal-form">
                        <div className = "form-group">
                            <label>Especialidade:</label>
                            <select 
                                value = {novaEspecialidade} 
                                onChange = {(e) => setNovaEspecialidade(e.target.value)}
                                required
                            >
                                <option value="">Selecione...</option>
                                <option value="Cardiologia">Cardiologia</option>
                                <option value="Dermatologia">Dermatologia</option>
                                <option value="Neurologia">Neurologia</option>
                                <option value="Oftalmologia">Oftalmologia</option>
                                <option value="Ortopedia">Ortopedia</option>
                                <option value="Psicologia">Psicologia</option>
                            </select>
                        </div>

                        {/* Exibição dinâmica de requisitos */}
                        {novaEspecialidade && (
                            <div className = "requisitos-box">
                                <strong>Documentos Obrigatórios:</strong>
                                <ul>
                                    {(REQUISITOS_ESPECIALIDADE[novaEspecialidade] || REQUISITOS_ESPECIALIDADE['Padrao']).map((req, i) => (
                                        <li key = {i}>{req}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className = "form-group">
                            <label>Motivo/Sintomas:</label>
                            <textarea value = {novoMotivo} onChange = {(e) => setNovoMotivo(e.target.value)} required />
                        </div>

                        <div className = "form-group">
                            <label>Anexar Documentos (PDF/Imagens):</label>
                            <input type = "file" multiple onChange = {handleFileChange} className = "file-input" />
                            <small>{arquivos.length} arquivo(s) selecionado(s)</small>
                        </div>

                        <button type = "submit" disabled = {enviando} className = "submit-button">
                            {enviando ? 'Enviando...' : 'Enviar Solicitação e Documentos'}
                        </button>
                    </form>
                </section>
            )}
        </div>
    )
}

export default PortalPaciente