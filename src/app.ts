import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swaggerConfig';
import { env } from './config/env';
import { AppError } from './utils/app-error';

const app: Application = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configurável via variável de ambiente
const allowedOrigins = env.corsOrigin.split(',').map((origin) => origin.trim());
app.use(
  cors({
    origin: env.nodeEnv === 'production' ? allowedOrigins : true,
    credentials: true,
  })
);

// Rate limiting global da API
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente mais tarde.' },
  // Nos testes automatizados o limite atrapalharia a suíte
  skip: () => env.nodeEnv === 'test',
});
app.use('/api', globalLimiter);

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
app.use((err: Error & { type?: string }, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // JSON malformado no corpo da requisição
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido no corpo da requisição' });
  }

  console.error(err.stack);
  return res.status(500).json({ error: 'Erro interno do servidor' });
});

export default app;
