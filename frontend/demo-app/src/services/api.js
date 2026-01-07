import axios from 'axios'
// Importando dados de teste (REMOVER AO IMPLEMENTAR O BACK-END)
import mockUsers from '../data/users.json'
import mockData from '../data/data.json'

// URL base da API (endereço do back-end)
const API_BASE_URL = 'http://localhost:5000/api'

// Simulando o acesso (REMOVER AO IMPLEMENTAR O BACK-END)
const is_test = true

// Criando e configurando a instância do Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    // Tipo de conteúdo padrão para requisições com JSON
    'Content-Type': 'application/json',
  },
  // Tempo limite de 10 segundos
  timeout: 10000,
})

// Interceptor para adicionar o token de autenticação em todas as requisições
api.interceptors.request.use((config) => {
  // Pega o token do localStorage, onde ele será salvo após o login
  const token = localStorage.getItem('qualifica_saude_token') 
  
  if (token) {
    // Adiciona o token no header de Autorização
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

// Testando o acesso (REMOVER AO IMPLEMENTAR O BACK-END)
if (is_test) {
    // Pegnado o adaptador padrão do axios (que faz a requisição real)
    const defaultAdapter = axios.getAdapter(axios.defaults.adapter)

    api.defaults.adapter = async (config) => {
        // Simulando um delay
        await new Promise(r => setTimeout(r, 300))

        // Simulando o login
        if (config.url.endsWith('/auth/login') && config.method === 'post') {
            try {
                // O axios envia 'data' como string quando usa adapter, precisamos converter
                const credenciais = typeof config.data === 'string' ? JSON.parse(config.data) : config.data

                const mockUser = mockUsers.find(u => u.identificacao === credenciais.identificacao && u.senha === credenciais.senha)

                if (mockUser) {
                    // Retorna a estrutura de resposta que o Axios espera
                    return {
                        status: 200,
                        statusText: 'OK',
                        headers: {},
                        config,
                        data: {
                            token: `mock_token_${mockUser.user.perfil}`,
                            user: mockUser.user
                        }
                    }
                } 
                else {
                    // Lança erro para cair no catch do seu componente
                    throw {
                        response: {
                            status: 401,
                            data: { message: 'Usuário não encontrado.' }
                        }
                    }
                }
            } 
            catch (error) {
                // Se o erro foi lançado acima, ele é repassado
                return Promise.reject(error.response ? error : { 
                    response: { status: 500, data: { message: 'Erro interno no Mock' } } 
                })
            }
        }

        // Fornece os dados de teste para PortalPaciente.js
        if (config.url.includes('/paciente') && config.method === 'get') {
            console.log("Mock: Retornando dados do paciente")
            return { status: 200, data: mockData.solicitacaoPaciente }
        }

        // Fornece os dados de teste para PainelProfissionalSaude.js
        if (config.url.includes('/secretaria/fila-final') && config.method === 'get') {
            return { status: 200, data: mockData.filaFinalSecretaria }
        }
        
        // Fornece um blob falso para exportar a fila em SecretariaSaude.js
        if (config.url.includes('/secretaria/exportar') && config.method === 'get') {
             return { status: 200, data: new Blob(["col1,col2\nval1,val2"], { type: 'text/csv' }) }
        }

        // Fornece os dados de teste da fila para PainelProfissionalSaude.js
        if (config.url.includes('/profissional/fila') && config.method === 'get') {
            return { status: 200, data: mockData.filaProfissional }
        }

        // Permite visualizar uma solicitação em PainelProfissionalSaude.js
        if (config.url.match(/\/profissional\/solicitacoes\/\d+$/) && config.method === 'get') {
             return { status: 200, data: mockData.detalheSolicitacaoProfissional }
        }
    }
}

export default api