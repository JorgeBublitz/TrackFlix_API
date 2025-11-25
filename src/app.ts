import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import routes from './routes';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swaggerConfig';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: "https://fhub.vercel.app",
  credentials: true
}));

// Prefixo padrão da API
app.use('/api', routes);

// Rota da Documentação Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check (fora do prefixo)
app.get('/', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API está funcionando' });
});

// 404 - rota não encontrada
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Tratamento global de erros
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

export default app;
