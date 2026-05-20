# 📋 Battle Barber — Documentação Completa para Handoff

> **Data de geração:** 20 de Maio de 2026  
> **Projeto:** Battle Barber — Plataforma de agendamentos e batalhas entre barbeiros  
> **Repositório local:** `C:\Users\Usuario\Desktop\Battle Barber`  
> **Repo no GitHub:** `samwell-mp4/batalha-de-barbeiros`

---

## 🧠 Visão Geral do Produto

O **Battle Barber** é uma plataforma mobile-first (PWA-like) para barbeiros e clientes, que combina:

1. **Agendamento de serviços** (estilo Uber, com matchmaking em tempo real)
2. **Mapa de barbeiros** com geolocalização ao vivo
3. **Liga de batalhas** — barbeiros se desafiam em duelos de fotos de cortes votados pela comunidade
4. **Feed social** com posts, likes e comentários
5. **Chat direto** entre usuários
6. **Perfil do barbeiro** com portfólio, galeria, estatísticas e configuração de serviços

---

## 🏗️ Arquitetura Geral

```
Battle Barber/
├── src/                      ← Frontend (React + Vite + TailwindCSS v4)
│   ├── App.tsx               ← Roteamento principal (React Router v7)
│   ├── components/
│   │   └── Layout.tsx        ← Shell com navegação inferior (bottom nav)
│   ├── pages/
│   │   ├── Auth.tsx          ← Login / Cadastro
│   │   ├── World.tsx         ← Feed social (home)
│   │   ├── Map.tsx           ← Mapa de barbeiros (Leaflet)
│   │   ├── League.tsx        ← Liga de batalhas 1x1
│   │   ├── Agenda.tsx        ← Agendamento (cliente e barbeiro)
│   │   ├── Profile.tsx       ← Perfil (próprio e de outros)
│   │   ├── Messages.tsx      ← Chat entre usuários
│   │   ├── Battle.tsx        ← Tela de batalha (componente auxiliar)
│   │   └── Ranking.tsx       ← Ranking global (componente auxiliar)
│   └── services/
│       └── api.ts            ← Todas as chamadas HTTP ao backend
│
└── server/                   ← Backend (Express + Prisma + PostgreSQL)
    ├── src/
    │   ├── index.ts          ← Entry point do Express
    │   ├── lib/prisma.ts     ← Singleton do PrismaClient
    │   └── routes/
    │       ├── auth.ts       ← Registro, login, perfil, senha
    │       ├── barbers.ts    ← Localizações, perfil, rating
    │       ├── posts.ts      ← Feed social (CRUD + likes + comentários)
    │       ├── appointments.ts ← Agendamentos (express, fila, padrão)
    │       ├── championships.ts ← Batalhas 1x1 (liga completa)
    │       └── messages.ts   ← Chat (JSON file-based)
    └── prisma/
        └── schema.prisma     ← Schema do banco de dados
```

---

## 🛠️ Stack Tecnológico

### Frontend
| Tecnologia | Versão | Uso |
|---|---|---|
| React | 19.2.6 | UI |
| React Router DOM | 7.15.1 | Roteamento SPA |
| TailwindCSS | 4.3.0 | Estilização (via `@tailwindcss/vite`) |
| Framer Motion | 12.38.0 | Animações |
| Leaflet + React Leaflet | 1.9.4 / 5.0.0 | Mapa interativo |
| Lucide React | 1.16.0 | Ícones |
| Vite | 8.0.12 | Bundler |
| TypeScript | 6.0.2 | Tipagem |

### Backend
| Tecnologia | Versão | Uso |
|---|---|---|
| Express | 5.2.1 | Servidor HTTP |
| Prisma | 6.19.3 | ORM |
| PostgreSQL | — | Banco de dados |
| ts-node | 10.9.2 | Execução TypeScript dev |
| CORS | 2.8.6 | Middleware CORS |
| dotenv | 17.4.2 | Variáveis de ambiente |

### DevOps
| Tecnologia | Uso |
|---|---|
| Docker (multi-stage) | Build de produção |
| Nginx | Servir frontend (via nginx.conf) |
| EasyPanel | Hospedagem na VPS |
| PostgreSQL externo | `plug_sales_dispatch_app_gressbarber2:5432` |

---

## 🗄️ Banco de Dados (Prisma Schema)

### Modelos Principais

#### `User`
```
id, name, email, password, avatar (Text), bio
role: CLIENT | BARBER | ADMIN
city, state, neighborhood, address, number
instagram, whatsapp
createdAt, updatedAt
→ barberProfile (Barber?)
→ appointments (como cliente)
→ likes, comments, votes
```

#### `Barber`
```
id, userId (→ User)
barberShop, latitude, longitude
specialties: String[]
workingHours, schedule (Text JSON), bio
rating (Float, default 5.0), reviewsCount
isPremium, gallery: String[]
isOnline, statsWins, statsLosses
followersCount, servicesConfig (Text JSON)
→ appointments, posts, championships
```

#### `Appointment`
```
id, clientId (→ User), barberId (→ Barber)
date (DateTime), time (String)
status: PENDING | PROPOSAL_SENT | CONFIRMED | ARRIVED | IN_SERVICE | PAYMENT | COMPLETED | CANCELLED
services: String[], price, paymentMethod
isExpress, isQueue
latitude, longitude (para geolocação)
createdAt
```

#### `Post` (Feed Social)
```
id, barberId (→ Barber)
content (descrição), imageUrl, videoUrl
likesCount, createdAt
→ likes (Like[]), comments (Comment[])
```

#### `Like`
```
id, postId, userId
@@unique([postId, userId])  ← impede duplo like
```

#### `Comment`
```
id, postId, userId, content, createdAt
```

#### `Championship` (Batalha)
```
id, name, creatorId, ligaId
modality: "x1" (padrão atual) | outros
theme, prize, votingTime (horas, default 24)
maxParticipants (default 16)
startDate, startTime
status: OPEN | WAITING | ONGOING | FINISHED
→ participants (Barber[]), matches (Match[])
```

#### `Match`
```
id, championshipId (→ Championship)
round, player1Id, player2Id
photo1, photo2 (fotos do corte)
score1, score2 (votos)
winnerId, status: PENDING | LIVE | FINISHED
startedAt, createdAt
→ votes (Vote[])
```

#### `Vote`
```
id, matchId, userId, choiceId (barberId votado)
ipAddress, userAgent
@@unique([matchId, userId])  ← 1 voto por usuário
```

#### `MapMarker`
```
id, title, description, latitude, longitude
type: SALON | ARENA | EVENT
```

---

## 🔌 API REST — Endpoints

**Base URL (dev):** `http://localhost:3000/api`  
**Base URL (prod):** `/api` (servido pelo mesmo Express que o frontend)

### AUTH — `/api/auth`

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/register` | Registra CLIENT ou BARBER (cria Barber profile se BARBER) |
| POST | `/login` | Login com email + senha (texto puro, **sem hash ainda**) |
| GET | `/me/:id` | Busca dados frescos do usuário logado |
| PUT | `/profile/:id` | Atualiza nome, bio, avatar |
| PUT | `/password/:id` | Troca senha (verifica senha atual) |

> ⚠️ **ATENÇÃO:** Senhas são armazenadas em texto puro. Não foi implementado bcrypt ainda.

### BARBERS — `/api/barbers`

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/locations` | Todos os barbeiros para o mapa (inclui status de appointments ativos) |
| GET | `/` | Lista todos os barbeiros |
| GET | `/:id` | Perfil do barbeiro (por `barber.id` ou `user.id`) + posts + _count |
| PUT | `/:id` | Atualiza especialidades, horários, bio, servicesConfig, schedule |
| POST | `/status` | Atualiza localização e isOnline do barbeiro |
| POST | `/:id/rate` | Submete avaliação (recalcula rating médio) |

### POSTS — `/api/posts`

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/` | Feed social (20 posts, mais recentes primeiro) |
| POST | `/` | Cria post (aceita base64, salva em `/public/uploads/`) |
| PUT | `/:id` | Atualiza descrição do post |
| DELETE | `/:id` | Deleta post |
| POST | `/:id/like` | Toggle de like (cria ou remove) |
| POST | `/:id/comment` | Adiciona comentário |
| DELETE | `/:postId/comment/:commentId` | Deleta comentário específico |

### APPOINTMENTS — `/api/appointments`

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/` | Cria agendamento (padrão, express ou fila) |
| GET | `/active-requests` | Pedidos express/fila ativos num raio de 5km |
| GET | `/client/:clientId` | Agendamentos de um cliente |
| GET | `/barber/:barberId` | Agendamentos de um barbeiro |
| GET | `/:id` | Detalhes de um agendamento |
| GET | `/user-active/:userId` | Agendamento ativo atual de um usuário |
| PATCH | `/:id/status` | Atualiza status, barbeiro, preço, data, hora |
| DELETE | `/:id` | Deleta um agendamento |
| DELETE | `/clear-history/:userId` | Limpa histórico de COMPLETED/CANCELLED |

**Regras de negócio de agendamento:**
- Cliente não pode criar novo agendamento se já tem um PENDING ou PROPOSAL_SENT
- Limite de 2 agendamentos não-cancelados por dia
- Distância calculada com fórmula Haversine (raio 5km para express/fila)

**Fluxo de status do Appointment:**
```
PENDING → PROPOSAL_SENT → CONFIRMED → ARRIVED → IN_SERVICE → PAYMENT → COMPLETED
                                                                      ↓
                                                                  CANCELLED (a qualquer momento)
```

### CHAMPIONSHIPS — `/api/championships`

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/` | Lista todos os campeonatos (com auto-sync de status) |
| POST | `/` | Cria desafio 1x1 (gera Match PENDING automaticamente) |
| POST | `/:id/accept` | Oponente aceita o desafio com foto2 |
| POST | `/:id/start-now` | Criador inicia a batalha imediatamente |
| POST | `/:id/start-scheduled` | Criador agenda início automático |
| POST | `/:id/vote` | Usuário vota em um dos barbeiros |
| POST | `/:id/like` | Like/unlike no match (in-memory) |
| POST | `/:id/comment` | Comentário no match (in-memory) |
| GET | `/:id` | Detalhes de um campeonato específico |

**Lógica de Auto-Sync (checkAndSyncChampionship):**
- Se WAITING + não aceito + passou do horário → status FINISHED
- Se WAITING + aceito + passou do horário → status ONGOING (LIVE)
- Se ONGOING + votingTime expirou → calcula vencedor + FINISHED
- Suporta header `X-Test-Current-Time` para testes temporais

> ⚠️ **Likes e comentários de batalha são in-memory** — não persistem entre restarts do servidor.

### MESSAGES — `/api/messages`

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/:userId1/:userId2` | Mensagens entre dois usuários |
| POST | `/` | Envia mensagem |
| GET | `/conversations/:userId` | Lista todas as conversas de um usuário |

> ⚠️ **Mensagens são salvas em arquivo JSON** (`server/src/routes/messages.json`) — não no banco PostgreSQL.

---

## 📱 Páginas do Frontend

### `/auth` — Auth.tsx (~44KB)
- Login e Cadastro em abas
- Cadastro de CLIENT: dados pessoais
- Cadastro de BARBER: dados pessoais + dados da barbearia (coordenadas, especialidades, horários)
- Sessão salva no `localStorage` como `user`

### `/` — World.tsx (~36KB)
- Feed social principal
- Posts dos barbeiros com fotos, likes, comentários
- Botão de criar post (barbeiros)
- Acesso ao perfil de outros barbeiros

### `/map` — Map.tsx (~131KB) ← MAIOR ARQUIVO
- Mapa Leaflet com barbeiros online
- Modo cliente: encontrar barbeiro, iniciar agendamento
- Modo barbeiro: ver pedidos express/fila no raio de 5km, aceitar, gerenciar sessão
- HUD de status da sessão de atendimento
- Fluxo completo do atendimento com timer de tolerância

### `/league` — League.tsx (~83KB)
- Lista de desafios 1x1
- Criar novo desafio (escolher oponente, foto do corte, tema, prêmio, horário)
- Ver batalhas LIVE com placar de votos em tempo real
- Aceitar desafio recebido (upload de foto)
- Iniciar batalha (agora ou no horário agendado)
- Feed de batalhas com likes e comentários
- Tela pública (não requer login para ver)

### `/agenda` — Agenda.tsx (~125KB)
- Visão do cliente: seus agendamentos, cancelar, avaliar
- Visão do barbeiro: gerenciar pedidos, enviar proposta, confirmar chegada, iniciar serviço, registrar pagamento
- Histórico e limpeza de histórico

### `/profile` — Profile.tsx (~103KB)
- Perfil próprio (`/profile`) e de outros (`/profile/:id`)
- Avatar, bio, estatísticas (batalhas, seguidores, avaliação)
- Grid de posts do barbeiro
- Editar/deletar posts (menu ⋮) — somente o dono
- Comentários com opção de deletar o próprio
- Configuração de serviços (barbeiro)
- Configuração de horários de atendimento
- Editar perfil (nome, bio, foto)
- Trocar senha

### `/messages` — Messages.tsx (~13KB)
- Lista de conversas
- Chat 1-a-1 com pooling a cada 3s

---

## 🔐 Sistema de Sessão

- **Sem JWT real** (JWT_SECRET existe no .env mas não é usado nas rotas)
- Sessão baseada em `localStorage.setItem('user', JSON.stringify(user))`
- A cada mudança de rota, `Layout.tsx` faz um GET `/api/auth/me/:id` para sincronizar dados frescos
- Redirecionamento automático para `/auth` se não logado (exceto `/league`)

**Contexto passado às páginas via `useOutletContext()`:**
```typescript
{
  isBarberView: boolean,        // user.role === 'BARBER'
  matchSession: { 
    status: 'idle' | 'searching' | 'proposal_sent' | 'accepted' | 'arrived' | 'in_service' | 'payment' | 'finished' | 'receipt',
    incomingRequests: any[],
    activeMatch: any | null,
    bufferTime: number,         // segundos até confirmar chegada (default 30s)
    toleranceTimer: number,     // segundos de tolerância (default 1800 = 30min)
    evaluations: { clientRated: boolean; barberRated: boolean }
  },
  setMatchSession: Function
}
```

---

## 🐳 Deploy (Docker + EasyPanel)

### Dockerfile (multi-stage)
1. **build-frontend:** `node:20-alpine` → `npm install` → `npm run build` → gera `/app/dist`
2. **build-backend:** `node:20-alpine` → `npm install` → `prisma generate` → `tsc`
3. **produção:** copia `dist` para `./public`, `server/dist` para rodar

### Comando de startup
```sh
npx prisma generate && (npx prisma db push --accept-data-loss || echo 'Aviso: sync falhou') && npm start
```

### Variáveis de Ambiente (.env no server/)
```env
DATABASE_URL="postgres://gressbarber:Barber2026gress!@plug_sales_dispatch_app_gressbarber2:5432/gressbarber?sslmode=disable"
PORT=3000
JWT_SECRET="elite_barber_secret_2026"
```

### Frontend serve via Express
- O Express serve o `dist` compilado do Vite em `/public`
- Wildcard route: qualquer rota não-API devolve `index.html` (SPA routing)
- JSON payload limit: **10MB** (para suportar upload de imagens em base64)

---

## 📡 Upload de Imagens

- Imagens são enviadas como **base64** no body JSON
- O servidor (`posts.ts`) converte base64 → arquivo `.webp` em `public/uploads/`
- URL salva no banco: `/uploads/nome-do-arquivo.webp`
- Avatares de usuário: salvos diretamente como base64 `Text` no campo `avatar` do User

---

## 🧪 Testes

Arquivo: `server/test_1x1_flow.js` (~8KB)
- Testa o fluxo completo de um desafio 1x1
- Usa o header `X-Test-Current-Time` para simular passagem do tempo
- Cobre: criação, aceitação, início, votação, expiração automática

```bash
# Rodar teste
node server/test_1x1_flow.js
```

---

## ⚠️ Pontos Críticos / Dívidas Técnicas

| Item | Status | Risco |
|---|---|---|
| **Senhas em texto puro** | ❌ Não implementado | ALTO — usar bcrypt |
| **Sem JWT real** nas rotas | ❌ Não implementado | ALTO — qualquer um pode alterar dados alheios |
| **Chat em arquivo JSON** | ⚠️ Funcional mas frágil | MÉDIO — migrar para tabela no PostgreSQL |
| **Likes/comentários de batalha em memória** | ⚠️ Perde no restart | MÉDIO — migrar para tabela no PostgreSQL |
| **Upload de avatar como base64 no banco** | ⚠️ Pesado | MÉDIO — usar storage externo (S3/R2) |
| **Sem WebSocket/SSE** | ⚠️ Polling manual | BAIXO — adicionar real-time com Socket.io |
| **Sem paginação no feed** | ⚠️ Hardcoded `take: 20` | BAIXO — adicionar cursor-based pagination |
| **Sem testes unitários** | ❌ Apenas test_1x1_flow.js | BAIXO |

---

## 🗺️ Fluxos Principais

### Fluxo de Agendamento Express (Cliente → Barbeiro)
```
1. Cliente abre /map, ativa GPS
2. Clica em "Quero Express" → cria Appointment (isExpress: true, sem barbeiro)
3. Barbeiros próximos (5km) veem o pedido em /map
4. Barbeiro clica "Aceitar" → PATCH /appointments/:id/status { status: 'PROPOSAL_SENT', barberId }
5. Cliente recebe proposta (polling no Layout/Agenda)
6. Cliente confirma → status: CONFIRMED
7. Cliente "Cheguei" → status: ARRIVED  
8. Barbeiro inicia serviço → status: IN_SERVICE
9. Barbeiro registra pagamento → status: PAYMENT
10. Concluído → status: COMPLETED
11. Ambos podem avaliar um ao outro (rateBarber)
```

### Fluxo de Batalha 1x1
```
1. Barbeiro A abre /league, clica "Criar Desafio"
2. Escolhe Barbeiro B, sobe foto do corte (photo1), define tema/horário
3. POST /championships → cria Championship (WAITING) + Match (PENDING)
4. Barbeiro B vê o desafio pendente em /league
5. Barbeiro B clica "Aceitar" → POST /championships/:id/accept { photo2 }
6. Criador pode "Iniciar Agora" ou "Agendar Início"
   - "Iniciar Agora" → Match vira LIVE, Championship vira ONGOING
   - "Agendar" → auto-sync na próxima request que passar do horário
7. Usuários votam → POST /championships/:id/vote { userId, choiceId }
8. Quando votingTime expira → auto-sync calcula vencedor, FINISHED
```

### Fluxo de Registro de Barbeiro
```
1. POST /auth/register com role: "BARBER"
2. Cria User + Barber em transação
3. Barber começa com isOnline: true
4. Retorna user completo com barberProfile incluso
5. Salvo no localStorage
```

---

## 🎨 Design System

- **Tema:** Dark mode (`#030303` de fundo externo) + card branco central (`max-w-md`)
- **Fontes:** Inter (geral), Orbitron (labels da nav bar)
- **Navegação:** Bottom nav flutuante com glassmorphism (`bg-white/80 backdrop-blur-xl`)
- **Ícones:** Lucide React
- **Animações:** Framer Motion
- **Layout:** Mobile-first, centralizado, `max-w-md` simulando app mobile
- **Cores primárias:** Azul (`blue-600`) para estados ativos

---

## 📁 Arquivos-Chave para Contexto

| Arquivo | Tamanho | Importância |
|---|---|---|
| `src/pages/Map.tsx` | ~131KB | Core do matchmaking em tempo real |
| `src/pages/Agenda.tsx` | ~125KB | Gestão de agendamentos (cliente + barbeiro) |
| `src/pages/Profile.tsx` | ~103KB | Perfil social completo |
| `src/pages/League.tsx` | ~83KB | Sistema de batalhas completo |
| `server/prisma/schema.prisma` | 5.6KB | Toda a estrutura do banco |
| `src/services/api.ts` | 8.6KB | Todas as chamadas HTTP |
| `server/src/routes/championships.ts` | 16KB | Lógica de batalhas com auto-sync |
| `server/src/routes/appointments.ts` | 11KB | Lógica de matchmaking |

---

## 🚀 Como Rodar Localmente

```bash
# Na raiz do projeto
npm install
cd server && npm install && cd ..

# Configurar banco
cd server
cp .env.example .env  # ou criar .env manualmente
npx prisma db push    # sync schema → banco

# Rodar (frontend + backend juntos)
cd ..
npm run dev
# Frontend: http://localhost:5173
# Backend:  http://localhost:3000
```

---

## 📌 Estado Atual (Maio 2026)

### ✅ Funcionalidades Completas
- [x] Autenticação (registro e login para CLIENT e BARBER)
- [x] Mapa com barbeiros ao vivo
- [x] Agendamento padrão, express e fila
- [x] Fluxo completo de atendimento com status
- [x] Feed social com posts, likes e comentários
- [x] Editar/deletar posts (dono) e comentários (próprios)
- [x] Perfil do barbeiro com galeria e estatísticas
- [x] Configuração de serviços do barbeiro
- [x] Sistema de batalhas 1x1 (criar, aceitar, votar, auto-encerrar)
- [x] Likes e comentários nas batalhas
- [x] Chat direto entre usuários
- [x] Rating de barbeiros (calculado por média acumulada)
- [x] Deploy via Docker no EasyPanel

### 🔧 Em Progresso / Parcialmente Implementado
- [ ] Ranking global de barbeiros (`Ranking.tsx` existe mas pode estar incompleto)
- [ ] Tela de batalha individual (`Battle.tsx` existe mas pode ser auxiliar)
- [ ] Notificações em tempo real (atualmente polling manual)

### ❌ Não Implementado / Pendente
- [ ] Hash de senhas (bcrypt)
- [ ] JWT real nas rotas protegidas (middleware de auth)
- [ ] Migração do chat para PostgreSQL
- [ ] Migração de likes/comentários de batalha para PostgreSQL
- [ ] Storage de imagens externo (S3 ou Cloudflare R2)
- [ ] Push notifications
- [ ] Campeonatos multi-participantes (só 1x1 funcional)
- [ ] Busca de barbeiros por filtro na /league
- [ ] Sistema de seguidores (followersCount existe no schema, mas não há endpoint)
- [ ] Modo premium de barbeiro (isPremium existe no schema)

---

*Documentação gerada automaticamente com base no estado do código em 20/05/2026.*
