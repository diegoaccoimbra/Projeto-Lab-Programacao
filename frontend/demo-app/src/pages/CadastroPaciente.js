import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cadastrarPaciente } from '../services/pacienteServicos'

const CadastroPaciente = () => {
    const [formData, setFormData] = useState({
        nome: '',
        identificacao: '', // CPF
        senha: '',
        confirmarSenha: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        // Validação básica de senha
        if (formData.senha !== formData.confirmarSenha) {
            return setError('As senhas não coincidem.')
        }

        setLoading(true)
        try {
            await cadastrarPaciente({
                nome: formData.nome,
                identificacao: formData.identificacao,
                senha: formData.senha
            })
            alert('Cadastro realizado com sucesso! Agora você pode fazer login.')
            navigate('/') // Volta para a tela de login
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao realizar cadastro. Verifique os dados.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-page-container" style={{ maxWidth: '400px', margin: '50px auto' }}>
            <h2>Cadastro de Paciente</h2>
            <p>Preencha os campos abaixo para acessar o Qualifica Saúde.</p>

            <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                    <label htmlFor="nome">Nome Completo:</label>
                    <input id="nome" type="text" value={formData.nome} onChange={handleChange} required disabled={loading} />
                </div>

                <div className="form-group">
                    <label htmlFor="identificacao">CPF (apenas números):</label>
                    <input id="identificacao" type="text" value={formData.identificacao} onChange={handleChange} required disabled={loading} />
                </div>

                <div className="form-group">
                    <label htmlFor="senha">Crie uma Senha:</label>
                    <input id="senha" type="password" value={formData.senha} onChange={handleChange} required disabled={loading} />
                </div>

                <div className="form-group">
                    <label htmlFor="confirmarSenha">Confirme a Senha:</label>
                    <input id="confirmarSenha" type="password" value={formData.confirmarSenha} onChange={handleChange} required disabled={loading} />
                </div>

                {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}

                <button type="submit" disabled={loading} style={{ width: '100%', marginTop: '10px' }}>
                    {loading ? 'Processando...' : 'Finalizar Cadastro'}
                </button>
                
                <button type="button" onClick={() => navigate('/')} style={{ width: '100%', marginTop: '10px', backgroundColor: '#6c757d' }}>
                    Voltar para Login
                </button>
            </form>
        </div>
    )
}

export default CadastroPaciente