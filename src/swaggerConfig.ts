import swaggerJsDoc from 'swagger-jsdoc';
import { Options } from 'swagger-jsdoc';

const options: Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Minha API Node + TS',
            version: '1.0.0',
            description: 'Documentação da API com Autenticação JWT',
        },
        servers: [
            {
                url: 'https://trackflix-api-wlzi.onrender.com/',
                description: 'Servidor Remoto',
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
    apis: [
        './src/routes/*.ts',
        './src/docs/*.yaml'
    ],
};

export const swaggerSpec = swaggerJsDoc(options);