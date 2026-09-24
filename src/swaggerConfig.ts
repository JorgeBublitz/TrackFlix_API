import swaggerJsDoc from 'swagger-jsdoc';
import { Options } from 'swagger-jsdoc';

const options: Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'TrackFlix API',
            version: '1.2.0',
            description: 'API REST para listas pessoais de filmes e séries (favoritos, watchlist e histórico), comentários e amigos, com autenticação JWT e refresh token.',
            contact: {
                name: 'Jorge Luis Heringer Bublitz',
                email: 'bublitzjorge3@gmail.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:3000/',
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
