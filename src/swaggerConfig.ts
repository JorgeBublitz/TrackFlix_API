import swaggerJsDoc from 'swagger-jsdoc';
import { Options } from 'swagger-jsdoc';

const options: Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'TrackFlix API',
            version: '1.2.0',
            description: `API REST para acompanhamento pessoal de filmes e séries: favoritos, watchlist, histórico de visualização, comentários e amigos. Os títulos são referenciados por \`crossoverId\`, o ID do filme/série na TMDB — esta API não armazena metadados de filmes, apenas a relação do usuário com esses IDs.

**Autenticação:** JWT em dois tokens. Faça login em \`POST /api/auth/v2/login\` para obter um \`accessToken\` (curta duração) e um \`refreshToken\` (persistido no banco, rotacionado a cada uso em \`POST /api/auth/v2/refresh\`). Envie o access token no header \`Authorization: Bearer <token>\` nas rotas protegidas — clique em **Authorize** acima e informe apenas o \`accessToken\`.

**Rotas públicas:** endpoints prefixados com "public" (ex.: \`publicFavorite\`, \`publicWatchlist\`, \`publicHistory\`, \`publicFriends\`) e a listagem de comentários por item não exigem autenticação.

**Erros:** respostas de erro seguem o formato \`{ success: false, message }\`, com um campo \`errors\` adicional (por campo) em falhas de validação (400).`,
            contact: {
                name: 'Jorge Luis Heringer Bublitz',
                email: 'bublitzjorge3@gmail.com',
            },
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 3000}/`,
                description: 'Servidor Local',
            },
        ],
        // CONFIGURAÇÃO DE AUTH AQUI
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    // IMPORTANTE: O caminho deve pegar seus arquivos de rota
    apis: ['./src/docs/*.yaml'],
};

export const swaggerSpec = swaggerJsDoc(options);
