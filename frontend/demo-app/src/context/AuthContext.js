import React, { createContext, useState, useContext, useEffect } from 'react'
import { login as apiLogin, logout as apiLogout } from '../services/solicitacoesServicos'

// Criando o contexto
export const AuthContext = createContext()

// Crindo o provider
export const AuthProvider = ({ children }) => {
    // Estados que armazena o objeto do usuário e o estado do carregemanto
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    // Efeito usado pra checar o login ao iniciar a aplicação
    useEffect(() => {
        const checkAuth = () => {
            // Verifica se há um usuário salvo
            const storedUser = localStorage.getItem('qualifica_saude_user')
            
            if (storedUser) {
                try {
                    // Se tem um usuário salvo, ele é definido em "user"
                    setUser(JSON.parse(storedUser))
                } catch (e) {
                    // Em caso de erro, o armazenamento é limpo.
                    console.error("Erro ao carregar usuário do localStorage:", e)
                    apiLogout() 
                }
            }
            
            // A verificação inicial terminou
            setIsLoading(false)
        }
        checkAuth()
    }, []) 

    // Função de login usada por LoginPage.js
    const login = async (credenciais) => {
        try {
            // Chama a função de login Axios de solicitacoesServicos.js
            const userData = await apiLogin(credenciais)
            
            // "user" recebe os dados retornados pela função de login
            setUser(userData)
            
            // Retorna os dados para o LoginPage.js decidir o redirecionamento com base no perfil do usuário
            return userData    
        } 
        catch (error) {
            throw error
        }
    }

    // Função de logout que limpa o estado do usuário e o armazenamento local
    const logout = () => {
        setUser(null)
        apiLogout()
    }

    // Objeto que agrupa os estados e funções necessárias
    const contextValue = {
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user
    }

    // AuthContext.Provider fornece o objeto contextValue para os componentes filhos
    return (
        <AuthContext.Provider value = {contextValue}>{children}</AuthContext.Provider>
    )
}

// Hook usado nos demais componentes
export const useAuth = () => {
    return useContext(AuthContext)
}