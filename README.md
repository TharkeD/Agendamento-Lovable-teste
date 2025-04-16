# Sistema de Agendamento - Documentação

## Visão Geral

Este sistema de agendamento foi desenvolvido para permitir que empresas gerenciem seus serviços e agendamentos de forma eficiente. O sistema possui dois tipos de usuários:

1. **Administradores**: Podem gerenciar serviços, visualizar e gerenciar todos os agendamentos, configurar horários de funcionamento, gerenciar outros administradores e configurar notificações.

2. **Clientes**: Podem visualizar serviços disponíveis, agendar horários, gerenciar seus próprios agendamentos e configurar suas preferências de notificação.

## Tecnologias Utilizadas

- **Frontend**: React, TypeScript, TailwindCSS, Shadcn UI
- **Gerenciamento de Estado**: React Context API, React Query
- **Roteamento**: React Router
- **Formulários**: React Hook Form, Zod
- **Animações**: Framer Motion
- **Testes**: Vitest, React Testing Library

## Estrutura do Projeto

```
src/
├── components/         # Componentes reutilizáveis
│   ├── layout/         # Componentes de layout (Navbar, ProtectedRoute, etc.)
│   └── ui/             # Componentes de UI (botões, cards, etc.)
├── hooks/              # Hooks personalizados para gerenciamento de estado
├── lib/                # Utilitários e serviços
├── pages/              # Páginas da aplicação
└── App.tsx             # Componente principal com rotas
```

## Funcionalidades Principais

### Funcionalidades de Administrador

1. **Gerenciamento de Serviços**
   - Criar, editar e excluir serviços
   - Definir preço, duração e descrição dos serviços

2. **Gerenciamento de Agendamentos**
   - Visualizar todos os agendamentos
   - Filtrar agendamentos por data, cliente ou status
   - Cancelar ou excluir agendamentos

3. **Gerenciamento de Disponibilidade**
   - Configurar horários de funcionamento para cada dia da semana
   - Definir intervalos de almoço
   - Adicionar datas especiais (feriados, fechamentos, horários estendidos)

4. **Gerenciamento de Administradores**
   - Adicionar novos administradores
   - Remover administradores existentes

5. **Configuração de Notificações**
   - Configurar notificações por email e WhatsApp
   - Definir mensagens automáticas para confirmação e lembrete de agendamentos

6. **Dashboard**
   - Visualizar métricas e estatísticas de agendamentos
   - Acompanhar desempenho dos serviços

### Funcionalidades de Cliente

1. **Visualização de Serviços**
   - Visualizar lista de serviços disponíveis
   - Ver detalhes de cada serviço (preço, duração, descrição)

2. **Agendamento de Horários**
   - Selecionar serviço desejado
   - Escolher data e horário disponíveis
   - Fornecer informações de contato
   - Receber confirmação do agendamento

3. **Gerenciamento de Agendamentos**
   - Visualizar agendamentos futuros e passados
   - Cancelar agendamentos
   - Ver detalhes dos agendamentos

4. **Preferências de Notificação**
   - Configurar como deseja receber notificações (email, WhatsApp)
   - Definir quando deseja receber lembretes

5. **Perfil de Usuário**
   - Atualizar informações pessoais
   - Alterar senha

## Autenticação e Autorização

O sistema implementa um mecanismo de autenticação e autorização que:

1. Permite registro e login de usuários
2. Protege rotas com base no nível de acesso (admin ou cliente)
3. Gerencia sessões de usuário
4. Permite atualização de perfil e alteração de senha

## Sistema de Notificações

O sistema de notificações permite:

1. Envio de confirmações de agendamento
2. Envio de lembretes antes do horário agendado
3. Notificações de cancelamento
4. Configuração de preferências de notificação por usuário

## Testes

O sistema inclui testes unitários abrangentes para todos os componentes principais:

1. Serviço de usuários
2. Hook de autenticação
3. Componente de rota protegida
4. Hook de agendamentos
5. Hook de horários de funcionamento
6. Hook de notificações
7. Hook de serviços

## Instalação e Execução

1. Clone o repositório:
```
git clone https://github.com/TharkeD/Agendamento-Lovable-teste.git
```

2. Instale as dependências:
```
cd Agendamento-Lovable-teste
npm install
```

3. Execute o projeto em modo de desenvolvimento:
```
npm run dev
```

4. Execute os testes:
```
npm test
```

5. Construa o projeto para produção:
```
npm run build
```

## Credenciais Padrão

- **Administrador**:
  - Email: admin@exemplo.com
  - Senha: senha123

## Próximos Passos e Melhorias Futuras

1. Implementação de um backend real com banco de dados
2. Integração com serviços de email e WhatsApp reais
3. Implementação de pagamentos online
4. Adição de recursos de relatórios avançados
5. Implementação de um sistema de avaliações de serviços
6. Suporte a múltiplos idiomas
7. Aplicativo móvel nativo
