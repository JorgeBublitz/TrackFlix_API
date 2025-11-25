import swaggerJsDoc from 'swagger-jsdoc';
import { Options } from 'swagger-jsdoc';

const options: Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de Autenticação, Usuários e Comentários', // Título atualizado
            version: '1.0.0',
            description: 'Documentação oficial da API. Contém fluxos de Autenticação (Login, Registro, Refresh), CRUD de Usuários e Gerenciamento de Comentários.', // Descrição atualizada
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
            {
                url: 'https://fhub-api.vercel.app/',
                description: 'Servidor de Produção',
            }
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
    apis: [
        './src/routes/*.ts',
        './src/docs/*.yaml',
        './src/docs/auth.swagger.yaml',
    ],
};

export const swaggerSpec = swaggerJsDoc(options);
