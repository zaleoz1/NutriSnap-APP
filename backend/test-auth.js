#!/usr/bin/env node

import 'dotenv/config';
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testarAutenticacao() {
  console.log('🧪 Testando autenticação...\n');

  try {
    // 1. Testar login
    console.log('1️⃣ Testando login...');
    const loginResponse = await fetch(`${BASE_URL}/api/autenticacao/entrar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'teste@nutrisnap.com',
        senha: 'Teste123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login falhou: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login bem-sucedido');
    console.log(`   Token: ${loginData.token.substring(0, 20)}...`);
    console.log(`   Usuário: ${loginData.usuario.nome}`);

    // 2. Testar verificação de token
    console.log('\n2️⃣ Testando verificação de token...');
    const verifyResponse = await fetch(`${BASE_URL}/api/autenticacao/verificar`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!verifyResponse.ok) {
      throw new Error(`Verificação falhou: ${verifyResponse.status}`);
    }

    const verifyData = await verifyResponse.json();
    console.log('✅ Verificação bem-sucedida');
    console.log(`   Token válido: ${verifyData.valido}`);

    // 3. Testar rota protegida (quiz)
    console.log('\n3️⃣ Testando rota protegida (quiz)...');
    const quizResponse = await fetch(`${BASE_URL}/api/quiz`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        idade: 25,
        sexo: 'masculino',
        altura: 1.75,
        peso_atual: 70,
        peso_meta: 65,
        objetivo: 'emagrecer',
        nivel_atividade: 'moderado',
        frequencia_treino: '3_4_vezes',
        acesso_academia: 'academia_basica',
        dieta_atual: 'nao_controlo',
        preferencias: { sem_restricoes: true },
        habitos_alimentares: { lanches: true },
        restricoes_medicas: { nenhuma: true },
        historico_exercicios: 'iniciante',
        tipo_treino_preferido: { cardio: true },
        horario_preferido: 'manha',
        duracao_treino: '60_min',
        metas_especificas: { resistencia: true },
        motivacao: 'saude',
        obstaculos: { falta_tempo: true }
      })
    });

    if (!quizResponse.ok) {
      const errorData = await quizResponse.text();
      throw new Error(`Quiz falhou: ${quizResponse.status} - ${errorData}`);
    }

    const quizData = await quizResponse.json();
    console.log('✅ Quiz salvo com sucesso');
    console.log(`   Resposta: ${quizData.mensagem}`);

    console.log('\n🎉 Todos os testes passaram!');

  } catch (erro) {
    console.error('\n❌ Teste falhou:', erro.message);
    process.exit(1);
  }
}

testarAutenticacao();
