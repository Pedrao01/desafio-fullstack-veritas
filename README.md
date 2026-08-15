# Mini Kanban de Tarefas — Desafio Fullstack Veritas

Aplicação fullstack de Kanban com três colunas fixas (A Fazer, Em Progresso, Concluídas), desenvolvida como parte do desafio técnico da Veritas Consultoria Empresarial.

- **Backend:** Go (biblioteca padrão `net/http`, sem framework externo)
- **Frontend:** React + TypeScript (Vite)

## Estrutura do projeto

```
/backend
  main.go
/frontend
  package.json
  src/
    App.tsx
    Column.tsx
    Tasks.tsx (TaskCard)
    api.ts
    types.ts
/docs
  user-flow.png
  README.md
.gitignore
```

## Como rodar

### Backend (Go)

Pré-requisito: Go 1.22 ou superior instalado.

```bash
cd backend
go mod tidy
go run main.go
```

O servidor sobe em `http://localhost:8080`. As rotas ficam:

| Método | Rota          | Descrição                              |
|--------|---------------|-----------------------------------------|
| GET    | /tasks        | Lista todas as tarefas                  |
| POST   | /tasks        | Cria uma nova tarefa                    |
| PUT    | /tasks/{id}   | Atualiza título, descrição e/ou status  |
| DELETE | /tasks/{id}   | Remove uma tarefa                       |

### Frontend (React)

Pré-requisito: Node.js instalado.

```bash
cd frontend
npm install
npm run dev
```

A aplicação sobe em `http://localhost:5173` e já está configurada para consumir a API em `http://localhost:8080`.

**Importante:** o backend precisa estar rodando antes (ou junto) do frontend, já que o React busca as tarefas da API assim que a página carrega.

## Decisões técnicas

- **Armazenamento em memória**, usando um slice global protegido por `sync.Mutex`, evitando condições de corrida quando múltiplas requisições chegam simultaneamente.
- **IDs gerados via UUID** (`github.com/google/uuid`) no backend, nunca confiando em um ID enviado pelo cliente — evita colisões e centraliza essa responsabilidade no servidor.
- **Roteamento nativo do Go 1.22** (`http.HandleFunc("METODO /rota/{id}", ...)`), sem router externo (chi/gin), reduzindo dependências para um projeto deste porte.
- **CORS implementado como middleware** (função de ordem superior que "envolve" os handlers), evitando repetir a configuração de headers em cada rota, com tratamento explícito do preflight `OPTIONS`.
- **PUT com atualização parcial**: o endpoint de atualização só modifica os campos enviados no corpo da requisição (título, descrição e/ou status), preservando os demais. Isso evita que uma chamada que só move a tarefa entre colunas apague acidentalmente título ou descrição.
- **Validação de status no backend**: apenas os valores `todo`, `in_progress` e `done` são aceitos; qualquer outro valor retorna `400 Bad Request`. A validação foi colocada no servidor (não confiando apenas no `<select>` do frontend), já que o cliente não deveria ser a única camada de proteção dos dados.
- **Arquitetura do frontend em camadas**: `types.ts` (contratos de dados), `api.ts` (comunicação com o backend), `Column.tsx`/`Tasks.tsx` (apresentação), `App.tsx` (estado e orquestração) — separando responsabilidades e evitando lógica de rede misturada com JSX.
- **Componente `Column` reutilizável**, recebendo `status` como prop e filtrando a lista de tarefas internamente, em vez de repetir a estrutura de renderização três vezes no `App.tsx`.
- **Formulários controlados** (`useState` + `value`/`onChange`) para criação e edição de tarefas, com o modal de edição usando estados independentes dos estados do formulário de criação, evitando que os dois formulários interfiram um no outro.
- **Feedback de loading e erro**: estado de carregamento inicial (bloqueia a tela até a primeira busca da API responder) e estados de erro isolados por contexto (erro de carregamento vs. erro do formulário de criação), para que uma falha pontual não esconda o restante da interface.

## Limitações conhecidas

- Os dados não são persistidos em disco — ao reiniciar o servidor Go, todas as tarefas voltam ao estado inicial (em memória).
- Não há autenticação/autorização — qualquer cliente pode ler ou modificar qualquer tarefa.
- Movimentação entre colunas é feita via `<select>`, não por drag-and-drop.
- Sem testes automatizados (unitários ou de integração).
- Sem containerização (Docker).

## Melhorias futuras

- Persistência em arquivo JSON ou banco de dados (ex: SQLite), removendo a limitação de dados em memória.
- Drag-and-drop entre colunas para mover tarefas.
- Testes automatizados no backend (handlers) e no frontend (componentes).
- Autenticação básica, caso o Kanban precise ser multiusuário.
- Containerização com Docker para facilitar o setup do avaliador.
- Melhorar o tratamento de erro.