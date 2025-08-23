import mysql from 'mysql2/promise';

const bancoDados = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '12435687',
  database: process.env.DB_NAME || 'nutrisnap',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Teste de conexão
bancoDados.getConnection()
  .then(() => console.log('✅ Conectado ao banco MySQL'))
  .catch(err => {
    console.log('❌ Erro ao conectar ao banco:', err.message);
    console.log('💡 Dica: Verifique se o MySQL está rodando e se não há senha para o usuário root');
  });

export default bancoDados;