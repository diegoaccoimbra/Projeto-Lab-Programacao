# 🏥 Qualifica Saúde: Sistema de Qualificação e Gestão de Filas de Pacientes

---

## 🎯 Objetivo do Trabalho
O objetivo é desenvolver um sistema web para qualificar pacientes em fila de espera por consultas e procedimentos especializados no Sistema Único de Saúde (SUS) de um município. A ferramenta deve automatizar o processo de coleta e verificação de documentos comprobatórios, permitindo que a secretaria de saúde, os pacientes e os profissionais de saúde colaborem para garantir que as listas de espera enviadas aos hospitais contenham apenas solicitações com a documentação completa.

---

## 📋 Requisitos Funcionais

### RF1: Módulo de Importação da Fila 📂
A equipe da Secretaria de Saúde deve ser capaz de importar uma lista de pacientes para a fila de espera. O sistema deve ser capaz de ler arquivos nos formatos CSV ou XLSX contendo as seguintes informações dos pacientes:

- 📝 Nome completo
- 🆔 Número de identificação (CPF ou Cartão SUS)
- 🏥 Especialidade solicitada (ex.: Cardiologia, Neurologia)
- 🏷️ Motivo da solicitação
- 🏢 Unidade de saúde de origem


### RF2: Portal do Paciente para Anexar Documentos 💻
Os pacientes terão acesso a um portal individual. Caso seu registro já esteja na lista importada, eles poderão fazer login (por exemplo, utilizando o CPF) e visualizar a sua solicitação. O sistema deve permitir que o paciente:

- 📜 Visualize os documentos comprobatórios necessários para sua especialidade (ex.: "Encaminhamento médico", "Exames de sangue recentes").
- ⬆️ Realize o upload de arquivos (PDF, imagens) relacionados à sua solicitação.


### RF3: Módulo de Análise e Qualificação ✅❌
Os profissionais de saúde (como enfermeiros ou técnicos administrativos) terão um painel de controle para:

- 👀 Visualizar a fila de pacientes que já enviaram os documentos.
- 📑 Acessar os documentos anexados por cada paciente.
- ✅ Qualificar a solicitação (aprovada ou não). Caso a solicitação não seja aprovada, o sistema deve permitir justificar a decisão (ex.: "Documento ilegível", "Exame desatualizado").
- 🔄 Atualizar automaticamente o status do paciente no sistema.


### RF4: Fila Final e Exportação de Dados 📊
O sistema deve gerar uma lista final contendo apenas os pacientes que foram qualificados. Essa lista poderá ser:

- 📈 Visualizada em um painel de gestão.
- 💾 Exportada em formato CSV ou XLSX para ser enviada aos gestores de hospitais, garantindo que a lista de encaminhamentos esteja completa e sem pendências.


### RF5: Notificação de Status da Solicitação 🔔
Quando o status da solicitação do paciente for atualizado (aprovada, não aprovada, pendente), o sistema deve:

- 🖥️ Exibir a atualização no portal do paciente, destacando o status (ex.: "Aprovada", "Não Aprovada", "Pendente").
- 📜 Permitir que o paciente visualize o histórico das atualizações, com detalhes como:
    - "Documentos recebidos"
    - "Solicitação reprovada: Exame desatualizado"


### RF6: Opção de Filtrar no Painel de Controle do Profissional de Saúde 🔍
No painel de controle de qualificação, o profissional de saúde deve ser capaz de filtrar a fila por:

- 🏷️ Status da solicitação (aprovada, não aprovada, pendente)
- 💼 Especialidade (ex.: Cardiologia, Psicologia, Neurologia, etc.)

---

## Entidades do Sistema 🧑‍⚕️
- Paciente: Armazena os dados do paciente, incluindo o login de acesso.
- Solicitacao: Contém os dados da solicitação (especialidade, motivo, status da qualificação) e se relaciona com o Paciente.
- Documento: Armazena informações sobre cada arquivo enviado pelo paciente.
- ProfissionalDeSaude: Armazena os dados dos usuários responsáveis pela qualificação.