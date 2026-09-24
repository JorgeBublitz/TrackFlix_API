# TrackFlix API

[![CI](https://github.com/JorgeBublitz/TrackFlix_API/actions/workflows/ci.yml/badge.svg)](https://github.com/JorgeBublitz/TrackFlix_API/actions/workflows/ci.yml)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-4169E1?logo=postgresql&logoColor=white)
[![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-informational)](LICENSE)

API REST que funciona como backend de um app de filmes e séries. Cada usuário mantém suas listas pessoais (favoritos, watchlist e histórico), comenta em títulos e adiciona amigos.

Os dados dos filmes vêm da [TMDB](https://www.themoviedb.org/): o frontend consulta a TMDB e a API guarda apenas o ID de cada título (`crossoverId`) junto com os dados do usuário.

## Destaques técnicos

- **Autenticação JWT com refresh token rotativo**: cada renovação invalida o token anterior, e o logout revoga a sessão.
- **Validação com Zod** em body e parâmetros de rota, com mensagens de erro por campo.
- **Erros tratados de forma centralizada**: registro duplicado retorna `409`, referência inexistente retorna `404`, JSON malformado retorna `400`. Nenhum desses casos vira `500`.
- **Segurança**: senhas com bcrypt, Helmet, CORS configurável, rate limiting e login com mensagem única para não revelar quais emails estão cadastrados.
- **31 endpoints versionados (`/v2`)** documentados no Swagger.
- **Testes de integração** com Vitest e Supertest contra um PostgreSQL real, rodando no **GitHub Actions** a cada push. O CI também confere se as migrations batem com o schema do Prisma.

## Deploy

A API já foi publicada na **Render**, com o banco PostgreSQL no **Supabase**, e consumida por um frontend na **Vercel**. Hoje esse deploy está fora do ar. Para testar, rode localmente seguindo os passos abaixo.

## Stack

| Camada | Tecnologias |
| --- | --- |
| Runtime e linguagem | Node.js, TypeScript |
| Framework | Express 5 |
| Banco de dados | PostgreSQL com Prisma ORM |
| Validação | Zod |
| Segurança | JWT, bcryptjs, Helmet, express-rate-limit, CORS |
| Documentação | Swagger (OpenAPI 3) |
| Qualidade | Vitest, Supertest, ESLint, GitHub Actions |

## Arquitetura

```
src/
├── routes/v2/     # Definição das rotas e dos middlewares de cada grupo
├── controllers/   # Entrada e saída HTTP
├── services/      # Regras de negócio e acesso ao banco (Prisma)
├── middlewares/   # Autenticação JWT e validação com Zod
├── utils/         # JWT, hash, schemas Zod e tratamento de erros
├── docs/          # Especificação OpenAPI (Swagger)
├── app.ts         # Configuração do Express
└── server.ts      # Inicialização e encerramento gracioso
prisma/            # Schema e migrations
tests/             # Testes de integração
```

## Endpoints

Todas as rotas ficam sob `/api`. As rotas marcadas com 🔒 exigem `Authorization: Bearer <accessToken>`.

| Grupo | Rotas |
| --- | --- |
| **Auth** `/auth/v2` | `POST /register` · `POST /login` · `POST /refresh` · `POST /logout` 🔒 · `GET /me` 🔒 |
| **Usuários** `/auth/v2` | `GET /users` · `GET /getByName?name=` · `PUT /users/:id` 🔒 · `DELETE /users/:id` 🔒 |
| **Favoritos** `/favorites/v2` | `GET` · `POST` · `DELETE /favorite` 🔒 · `GET /publicFavorite?userId=` |
| **Watchlist** `/watchList/v2` | `GET` · `POST` · `DELETE /watchlist` 🔒 · `GET /publicWatchlist?userId=` |
| **Histórico** `/history/v2` | `GET` · `POST` · `DELETE /history` 🔒 · `GET /publicHistory?userId=` |
| **Comentários** `/comments/v2` | `POST /comments` 🔒 · `GET /comments/:crossoverId` · `PUT` · `DELETE /comments/:commentId` 🔒 · `POST /comments/:commentId/like` 🔒 · `POST /comments/:commentId/unlike` 🔒 |
| **Amigos** `/friends/v2` | `GET /friends` 🔒 · `POST` · `DELETE /friends/:friendId` 🔒 · `GET /publicFriends?userId=` |

A documentação interativa, com os formatos de requisição e resposta, fica em `http://localhost:3000/api-docs`.

Exemplo:

```bash
# Login
curl -X POST http://localhost:3000/api/auth/v2/login \
  -H "Content-Type: application/json" \
  -d '{"email": "jorge@email.com", "password": "Senha@123"}'

# Adicionar "Clube da Luta" (ID 550 na TMDB) aos favoritos
curl -X POST http://localhost:3000/api/favorites/v2/favorite \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"crossoverId": 550}'
```

## Como rodar localmente

**Pré-requisitos:** Node.js 20 ou superior e um PostgreSQL acessível.

```bash
git clone https://github.com/JorgeBublitz/TrackFlix_API.git
cd TrackFlix_API
npm install
cp .env.example .env        # preencha DATABASE_URL e os segredos JWT
npx prisma migrate deploy   # cria as tabelas
npm run dev                 # http://localhost:3000
```

### Variáveis de ambiente

| Variável | Descrição |
| --- | --- |
| `PORT` | Porta do servidor (padrão `3000`) |
| `NODE_ENV` | `development`, `production` ou `test` |
| `CORS_ORIGIN` | Origens permitidas em produção, separadas por vírgula |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Segredos de assinatura dos tokens |
| `JWT_ACCESS_EXPIRATION` / `JWT_REFRESH_EXPIRATION` | Validade dos tokens (padrão `15m` e `7d`) |
| `DATABASE_URL` / `DIRECT_URL` | Conexão com o PostgreSQL |

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor com recarga automática |
| `npm test` | Testes de integração (usa o banco do `DATABASE_URL`, que é limpo a cada teste) |
| `npm run lint` | ESLint |
| `npm run typecheck` | Checagem de tipos do TypeScript |
| `npm run build` / `npm start` | Build de produção e execução |

> Use um banco separado para os testes: a suíte apaga os dados antes de cada caso.

## Licença

MIT. Veja [LICENSE](LICENSE).
