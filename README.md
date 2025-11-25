# 🎬 TrackFlix API

## API REST para Gerenciamento de Conteúdo de Filmes e Séries

[![Status do Deploy](https://img.shields.io/badge/Deploy-Online-brightgreen?style=for-the-badge)](https://trackflix-api-wlzi.onrender.com)
[![Frontend](https://img.shields.io/badge/Frontend-Vercel-blue?style=for-the-badge)](https://fhub.vercel.app/)
[![Licença](https://img.shields.io/badge/Licen%C3%A7a-MIT-informational?style=for-the-badge)](LICENSE)

A **TrackFlix API** é uma robusta API RESTful desenvolvida em Node.js e TypeScript, projetada para ser o *backend* de uma aplicação de gerenciamento de conteúdo de entretenimento. Ela permite que usuários criem e gerenciem suas listas pessoais de filmes e séries, como favoritos, *watchlist* e histórico, além de interagir com a comunidade através de comentários.

O projeto se integra perfeitamente com a **The Movie Database (TMDB) API** para obter dados atualizados de filmes e séries, enquanto gerencia os dados específicos do usuário (autenticação e listas) em um banco de dados próprio.

---

## ✨ Funcionalidades Principais

A API oferece um conjunto completo de funcionalidades para uma experiência de usuário rica e segura:

| Funcionalidade | Detalhes |
| :--- | :--- |
| Cadastro e Login Seguro | Criação de contas e autenticação via **JWT (JSON Web Tokens)**. |
| Refresh Tokens | Mecanismo de segurança para renovação de tokens de acesso sem a necessidade de novo login. |
| Favoritos | Adicionar e remover filmes/séries da lista de favoritos. |
| Watchlist | Gerenciar itens que o usuário planeja assistir. |
| Histórico | Registrar o que o usuário já assistiu. |
| Comentários | Postar, editar e excluir comentários em filmes e séries. |
| TMDB API | Busca e recuperação de dados detalhados de filmes e séries em tempo real. |
| Swagger UI | Documentação interativa e completa dos endpoints da API. |

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído com um *stack* moderno e eficiente, garantindo performance e manutenibilidade:

### Backend

*   **Node.js**: Ambiente de execução JavaScript.
*   **TypeScript**: Linguagem de programação para tipagem estática.
*   **Express**: Framework web minimalista e flexível para Node.js.
*   **Prisma**: ORM (Object-Relational Mapper) de última geração para acesso ao banco de dados.
*   **Zod**: Biblioteca de validação de schemas para garantir a integridade dos dados.

### Segurança e Autenticação

*   **JWT (JSON Web Tokens)**: Para autenticação e autorização.
*   **Bcrypt/Bcryptjs**: Para *hashing* seguro de senhas.

### Banco de Dados

*   **PostgreSQL**: Banco de dados relacional robusto (hospedado no Supabase).

### Ferramentas de Desenvolvimento

*   **Nodemon**: Para desenvolvimento com *hot-reload*.
*   **ESLint & Prettier**: Para padronização e qualidade de código.
*   **Swagger-jsdoc & Swagger-ui-express**: Para documentação automática e interativa da API.

---

## 🚀 Deploy e Acesso

A API está atualmente em produção e pode ser acessada através dos seguintes links:

| Serviço | Tipo | URL |
| :--- | :--- | :--- |
| **API (Backend)** | Deploy Principal | [https://trackflix-api-wlzi.onrender.com](https://trackflix-api-wlzi.onrender.com) |
| **Documentação** | Swagger UI | [https://trackflix-api-wlzi.onrender.com/api-docs](https://trackflix-api-wlzi.onrender.com/api-docs) |
| **Frontend** | Aplicação Cliente | [FrameHub: Onde todos os frames se encontram](https://framehub.vercel.app/) |

---

## ⚙️ Instalação e Configuração Local

Para rodar a **TrackFlix API** em sua máquina local, siga os passos abaixo:

### Pré-requisitos

Certifique-se de ter instalado em seu ambiente:

*   [Node.js](https://nodejs.org/en/) (versão LTS recomendada)
*   [npm](https://www.npmjs.com/) ou [Yarn](https://yarnpkg.com/)
*   [PostgreSQL](https://www.postgresql.org/) (ou acesso a um banco de dados PostgreSQL remoto)

### 1. Clonar o Repositório

```bash
# Clone o repositório
git clone <URL_DO_SEU_REPOSITORIO>

# Entre no diretório do projeto
cd trackflix-api
```

### 2. Instalar Dependências

```bash
# Usando npm
npm install

# Ou usando yarn
# yarn install
```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo chamado `.env` na raiz do projeto e preencha com suas variáveis de ambiente.

**Exemplo de `.env`:**

```
# Configuração do Banco de Dados (Prisma)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME?schema=public"

# Chaves Secretas para JWT
JWT_ACCESS_SECRET="your_access_secret_key"
JWT_REFRESH_SECRET="your_refresh_secret_key"

JWT_ACCESS_EXPIRATION="1m"
JWT_REFRESH_EXPIRATION="1d"

# Porta da Aplicação
PORT=3000
```

### 4. Configurar o Banco de Dados

Com o Prisma, você pode aplicar as migrações e gerar o cliente:

```bash
# Aplicar as migrações do banco de dados
npx prisma migrate deploy

# Gerar o cliente Prisma (se necessário)
npx prisma generate
```

### 5. Rodar a Aplicação

#### Modo Desenvolvimento

Para rodar com *hot-reload* (recomendado para desenvolvimento):

```bash
npm run dev
# A API estará disponível em http://localhost:3000
```
---

## 🗺️ Endpoints Principais da API

A documentação completa e interativa de todos os endpoints está disponível no Swagger UI. Abaixo, listamos alguns dos principais grupos de rotas:

| Rota Base | Método | Descrição | 
| :--- | :--- | :--- |
| `/auth/register` | `POST` | Cria uma nova conta de usuário. |
| `/auth/login` | `POST` | Autentica o usuário e retorna `access_token` e `refresh_token`. |
| `/auth/refresh` | `POST` | Renova o `access_token` usando o `refresh_token`. |
| `/users/me` | `GET` | Retorna os dados do usuário autenticado. |
| `/lists/favorites` | `POST` | Adiciona um item à lista de favoritos. |
| `/lists/watchlist` | `GET` | Retorna a lista de *watchlist* do usuário. | 
| `/content/:id/comments` | `POST` | Adiciona um novo comentário a um filme/série. |
| `/tmdb/search` | `GET` | Busca filmes e séries na API externa (TMDB). |

**Acesse a documentação interativa para detalhes de *payloads*, respostas e códigos de status:**
[https://trackflix-api-wlzi.onrender.com/api-docs](https://trackflix-api-wlzi.onrender.com/api-docs)

---

## 🤝 Contribuição

Sinta-se à vontade para contribuir com o projeto!

1.  Faça um *fork* do projeto.
2.  Crie uma *branch* para sua funcionalidade (`git checkout -b feature/nova-funcionalidade`).
3.  Faça o *commit* de suas alterações (`git commit -m 'feat: Adiciona nova funcionalidade X'`).
4.  Faça o *push* para a *branch* (`git push origin feature/nova-funcionalidade`).
5.  Abra um *Pull Request*.

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---
