
//!/usr/bin/env node

/**
 * Script de configuração do backend NutriSnap.
 * Cria e atualiza o banco de dados, verifica dependências, variáveis de ambiente e chave Gemini.
 * Pode ser executado via: node setup.js [--create-test-user]
 */

import 'dotenv/config'; // Carrega variáveis do .env
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

console.log('🚀 Configurando NutriSnap Backend...\n');


/**
 * Cria e atualiza o banco de dados MySQL, executando o schema.sql e garantindo colunas extras.
 * Também pode criar um usuário de teste se solicitado.
 */
async function configurarBanco() {
  let conexao;
  try {
    // Conecta ao MySQL sem especificar banco para poder criar o banco se não existir
    conexao = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '123456'
    });

    console.log('✅ Conectado ao MySQL');

    // Lê o arquivo schema.sql
    const schemaPath = path.join(process.cwd(), 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Divide o schema em instruções SQL individuais
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    // Executa cada instrução SQL separadamente
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await conexao.query(statement);
        } catch (err) {
          // Ignora erro se o banco já existe
          if (!err.message.includes('database exists')) {
            throw err;
          }
        }
      }
    }
    console.log('✅ Banco de dados "nutrisnap" criado/atualizado');

    // Garante que a coluna metas_nutricionais existe na tabela metas
    try {
      await conexao.query('USE nutrisnap');
      const [colunas] = await conexao.query('DESCRIBE metas');
      const colunaExiste = colunas.some(col => col.Field === 'metas_nutricionais');
      if (!colunaExiste) {
        console.log('📝 Adicionando coluna metas_nutricionais à tabela metas...');
        await conexao.query('ALTER TABLE metas ADD COLUMN metas_nutricionais JSON AFTER calorias_diarias');
        console.log('✅ Coluna metas_nutricionais adicionada com sucesso');
      } else {
        console.log('✅ Coluna metas_nutricionais já existe');
      }
    } catch (err) {
      console.log('⚠️ Erro ao verificar/atualizar tabela metas:', err.message);
    }

    // Mostra as tabelas criadas
    const [tabelas] = await conexao.query('SHOW TABLES');
    console.log('📊 Tabelas criadas:', tabelas.map(t => Object.values(t)[0]).join(', '));

    // Cria usuário de teste se solicitado
    const criarUsuarioTeste = process.argv.includes('--create-test-user');
    if (criarUsuarioTeste) {
      const bcrypt = await import('bcryptjs');
      const senhaHash = await bcrypt.hash('Teste123', 12);
      await conexao.query(`
        INSERT INTO usuarios (nome, email, senha) 
        VALUES ('Usuário Teste', 'teste@nutrisnap.com', ?)
        ON DUPLICATE KEY UPDATE nome = VALUES(nome)
      `, [senhaHash]);
      console.log('👤 Usuário de teste criado: teste@nutrisnap.com / Teste123');
    }

  } catch (erro) {
    console.error('❌ Erro ao configurar banco:', erro.message);
    // Dicas para erro de permissão
    if (erro.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Dicas para resolver:');
      console.log('   1. Verifique se o MySQL está rodando');
      console.log('   2. Verifique o usuário e senha no arquivo .env');
      console.log('   3. Execute: mysql -u root -p');
      console.log('   4. Crie o usuário: CREATE USER "nutrisnap"@"%" IDENTIFIED BY "sua_senha";');
      console.log('   5. Dê permissões: GRANT ALL ON nutrisnap.* TO "nutrisnap"@"%";');
    }
    process.exit(1);
  } finally {
    if (conexao) {
      await conexao.end();
    }
  }
}


/**
 * Verifica e instala dependências do projeto (npm install se necessário).
 */
async function verificarDependencias() {
  console.log('📦 Verificando dependências...');
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const dependencias = Object.keys(packageJson.dependencies || {});
    if (dependencias.length === 0) {
      console.log('⚠️ Nenhuma dependência encontrada');
      return;
    }
    console.log(`✅ ${dependencias.length} dependências encontradas`);
    // Instala dependências se node_modules não existir
    if (!fs.existsSync('node_modules')) {
      console.log('📥 Instalando dependências...');
      const { execSync } = await import('child_process');
      execSync('npm install', { stdio: 'inherit' });
      console.log('✅ Dependências instaladas');
    } else {
      console.log('✅ Dependências já instaladas');
    }
  } catch (erro) {
    console.error('❌ Erro ao verificar dependências:', erro.message);
  }
}


/**
 * Verifica se o arquivo .env existe, cria a partir do exemplo se necessário.
 */
async function verificarArquivoEnv() {
  console.log('🔧 Verificando arquivo de ambiente...');
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), 'env.example');
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ Arquivo .env criado a partir do exemplo');
    } else {
      console.log('⚠️ Arquivo .env não encontrado. Crie um com as seguintes variáveis:');
      console.log('   DB_HOST=localhost');
      console.log('   DB_USER=root');
      console.log('   DB_PASS=sua_senha');
      console.log('   DB_NAME=nutrisnap');
      console.log('   JWT_SECRET=sua_chave_secreta');
      console.log('   PORT=3000');
      console.log('   GEMINI_API_KEY=sua_chave_gemini');
    }
  } else {
    console.log('✅ Arquivo .env encontrado');
  }
}


/**
 * Verifica se a chave da API Gemini está configurada no .env.
 */
async function verificarChaveGemini() {
  console.log('🔑 Verificando chave da API Gemini...');
  const chaveGemini = process.env.GEMINI_API_KEY;
  if (!chaveGemini || chaveGemini === 'sua_chave_gemini_aqui') {
    console.log('⚠️ GEMINI_API_KEY não configurada ou usando valor padrão');
    console.log('💡 Para usar análise de imagens, configure sua chave Gemini:');
    console.log('   1. Acesse: https://makersuite.google.com/app/apikey');
    console.log('   2. Crie uma nova chave de API');
    console.log('   3. Adicione no arquivo .env: GEMINI_API_KEY=sua_chave_aqui');
    console.log('   4. Reinicie o servidor');
  } else {
    console.log('✅ GEMINI_API_KEY configurada');
  }
}


/**
 * Função principal: executa todas as etapas de verificação e configuração do backend.
 */
async function main() {
  try {
    await verificarDependencias();
    await verificarArquivoEnv();
    await verificarChaveGemini();
    await configurarBanco();
    console.log('\n🎉 Configuração concluída com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('   1. Inicie o servidor: npm run dev');
    console.log('   2. Teste a API: http://localhost:3000/api/saude');
    console.log('   3. Configure o IP no mobile/src/services/api.js');
    if (process.argv.includes('--create-test-user')) {
      console.log('\n🧪 Usuário de teste disponível:');
      console.log('   Email: teste@nutrisnap.com');
      console.log('   Senha: Teste123');
    }
    console.log('\n🔑 Para análise de imagens:');
    console.log('   - Configure GEMINI_API_KEY no arquivo .env');
    console.log('   - Reinicie o servidor após configurar');
  } catch (erro) {
    console.error('\n❌ Configuração falhou:', erro.message);
    process.exit(1);
  }
}

// Executa o script principal
main();
