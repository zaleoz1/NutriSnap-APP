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
import rotasQuiz from './routes/quiz.js';
import rotasUsuarios from './routes/usuarios.js';
import bancoDados from './config/db.js';

const aplicacao = express();

// Configurações de segurança
aplicacao.use(helmet({
  contentSecurityPolicy: false, // Desabilitar para desenvolvimento
  crossOriginEmbedderPolicy: false
}));

// Configuração CORS
aplicacao.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://seu-dominio.com'] 
    : ['http://localhost:3000', 'http://192.168.0.135:3000', 'exp://192.168.0.135:8081'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware de parsing
aplicacao.use(express.json({ limit: '10mb' }));
aplicacao.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Limitação de taxa
const limitador = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite por IP
  message: {
    mensagem: 'Muitas requisições deste IP. Tente novamente em 15 minutos.',
    codigo: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

aplicacao.use('/api/', limitador);

// Middleware de logging
aplicacao.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const authorization = req.headers.authorization ? 
    `${req.headers.authorization.substring(0, 20)}...` : 'Nenhum';
  
  console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
  console.log(`🔑 Authorization: ${authorization}`);
  console.log(`👤 User ID: ${req.idUsuario || 'N/A'}`);
  
  next();
});

// Rota raiz
aplicacao.get('/', (req, res) => {
  res.json({ 
    mensagem: 'NutriSnap Backend API', 
    versao: '1.0.0',
    status: 'online',
    timestamp: new Date().toISOString(),
    ambiente: process.env.NODE_ENV || 'development',
    rotas: {
      saude: '/api/saude',
      autenticacao: '/api/autenticacao',
      refeicoes: '/api/refeicoes',
      metas: '/api/metas',
      treinos: '/api/treinos',
      analise: '/api/analise',
      quiz: '/api/quiz',
      usuarios: '/api/usuarios'
    }
  });
});

// Verificação de saúde
aplicacao.get('/api/saude', async (req, res) => {
  try {
    const [resultado] = await bancoDados.query('SELECT 1 as teste');
    
    res.json({ 
      ok: true, 
      banco: 'conectado',
      timestamp: new Date().toISOString(),
      ambiente: process.env.NODE_ENV || 'development',
      versao: '1.0.0'
    });
  } catch (erro) {
    console.error('❌ Erro na verificação de saúde:', erro);
    res.status(503).json({ 
      ok: false, 
      banco: 'desconectado', 
      aviso: 'Banco de dados não disponível',
      erro: erro.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Rotas da API
aplicacao.use('/api/autenticacao', rotasAutenticacao);
aplicacao.use('/api/usuarios', rotasUsuarios);
aplicacao.use('/api/refeicoes', rotasRefeicoes);
aplicacao.use('/api/metas', rotasMetas);
aplicacao.use('/api/treinos', rotasTreinos);
aplicacao.use('/api/analise', rotasAnalise);
aplicacao.use('/api/quiz', rotasQuiz);

// Middleware de tratamento de erros 404
aplicacao.use('*', (req, res) => {
  res.status(404).json({
    mensagem: 'Rota não encontrada',
    codigo: 'ROUTE_NOT_FOUND',
    rota: req.originalUrl,
    metodo: req.method
  });
});

// Middleware de tratamento de erros globais
aplicacao.use((erro, req, res, next) => {
  console.error('❌ Erro não tratado:', erro);
  
  res.status(500).json({
    mensagem: 'Erro interno do servidor',
    codigo: 'INTERNAL_SERVER_ERROR',
    timestamp: new Date().toISOString(),
    ambiente: process.env.NODE_ENV || 'development'
  });
});

// Configurações do servidor
const PORTA = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Inicializar servidor
const servidor = aplicacao.listen(PORTA, HOST, () => {
  console.log('🚀 NutriSnap Backend iniciado!');
  console.log(`✅ Servidor rodando em http://${HOST}:${PORTA}`);
  console.log(`🌐 Acessível na rede local em http://192.168.0.135:${PORTA}`);
  console.log(`🔒 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Banco: ${process.env.DB_NAME || 'nutrisnap'}`);
  console.log(`⏰ Iniciado em: ${new Date().toLocaleString('pt-BR')}`);
});

// Tratamento de encerramento gracioso
process.on('SIGTERM', () => {
  console.log('🛑 Recebido SIGTERM, encerrando servidor...');
  servidor.close(() => {
    console.log('✅ Servidor encerrado graciosamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Recebido SIGINT, encerrando servidor...');
  servidor.close(() => {
    console.log('✅ Servidor encerrado graciosamente');
    process.exit(0);
  });
});

// Tratamento de erros não capturados
process.on('uncaughtException', (erro) => {
  console.error('❌ Erro não capturado:', erro);
  process.exit(1);
});

process.on('unhandledRejection', (razao, promessa) => {
  console.error('❌ Promessa rejeitada não tratada:', razao);
  process.exit(1);
});