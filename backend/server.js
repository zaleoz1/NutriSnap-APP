import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import rotasAutenticacao from './routes/auth.js';
import rotasRefeicoes from './routes/meals.js';
import rotasMetas from './routes/goals.js';
import rotasTreinos from './routes/workouts.js';
import rotasAnalise from './routes/analyze.js';
import bancoDados from './config/db.js';

const aplicacao = express();
aplicacao.use(helmet());
aplicacao.use(cors());
aplicacao.use(express.json({ limit: '10mb' }));

// Limitação básica de taxa
const limitador = rateLimit({
  windowMs: 60 * 1000,
  max: 120
});
aplicacao.use(limitador);

// Rota raiz
aplicacao.get('/', (req, res) => {
  res.json({ 
    mensagem: 'NutriSnap Backend API', 
    versao: '1.0.0',
    status: 'online',
    rotas: {
      saude: '/api/saude',
      autenticacao: '/api/autenticacao',
      refeicoes: '/api/refeicoes',
      metas: '/api/metas',
      treinos: '/api/treinos',
      analise: '/api/analise'
    }
  });
});

// Verificação de saúde
aplicacao.get('/api/saude', async (req, res) => {
  try {
    await bancoDados.query('SELECT 1');
    res.json({ ok: true, banco: 'conectado' });
  } catch (erro) {
    res.json({ ok: true, banco: 'desconectado', aviso: 'Banco de dados não disponível' });
  }
});


aplicacao.use('/api/autenticacao', rotasAutenticacao);
aplicacao.use('/api/refeicoes', rotasRefeicoes);
aplicacao.use('/api/metas', rotasMetas);
aplicacao.use('/api/treinos', rotasTreinos);
aplicacao.use('/api/analise', rotasAnalise);

const PORTA = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
aplicacao.listen(PORTA, HOST, () => {
  console.log(`✅ Backend rodando em http://${HOST}:${PORTA}`);
  console.log(`🌐 Acessível na rede local em http://192.168.0.135:${PORTA}`);
});