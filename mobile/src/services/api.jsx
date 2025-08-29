import AsyncStorage from '@react-native-async-storage/async-storage';

export const URL_BASE = 'http://192.168.0.135:3000';

// Função principal para fazer requisições à API
export async function buscarApi(endpoint, opcoes = {}) {
  try {
    const { method = 'GET', token, body, headers = {} } = opcoes;
    
    const headersConfig = {
      'Content-Type': 'application/json',
      ...headers
    };
    
    if (token) {
      headersConfig.Authorization = `Bearer ${token}`;
    }
    
    const config = {
      method,
      headers: headersConfig,
    };
    
    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      config.body = JSON.stringify(body);
    }
    
    console.log(`🌐 API Request: ${method} ${URL_BASE}${endpoint}`);
    if (body) console.log('📦 Body:', body);
    
    const resposta = await fetch(`${URL_BASE}${endpoint}`, config);
    
    console.log(`📡 API Response: ${resposta.status} ${resposta.statusText}`);
    
    if (!resposta.ok) {
      let mensagemErro = 'Erro na requisição';
      
      try {
        const erroData = await resposta.json();
        mensagemErro = erroData.mensagem || erroData.message || mensagemErro;
      } catch {
        mensagemErro = resposta.statusText || mensagemErro;
      }
      
      const erro = new Error(mensagemErro);
      erro.status = resposta.status;
      erro.response = resposta;
      throw erro;
    }
    
    try {
      const dados = await resposta.json();
      console.log('✅ API Success:', dados);
      return dados;
    } catch (erroParse) {
      console.log('⚠️ Resposta não é JSON válido, retornando texto');
      return await resposta.text();
    }
    
  } catch (erro) {
    console.error('❌ API Error:', erro);
    
    if (erro.name === 'TypeError' && erro.message.includes('fetch')) {
      erro.message = 'Erro de conexão. Verifique sua internet e tente novamente.';
    }
    
    throw erro;
  }
}

// Funções de autenticação
export async function registrarUsuario(dados) {
  return buscarApi('/api/autenticacao/registrar', {
    method: 'POST',
    body: dados
  });
}

export async function fazerLogin(dados) {
  return buscarApi('/api/autenticacao/entrar', {
    method: 'POST',
    body: dados
  });
}

export async function verificarToken(token) {
  return buscarApi('/api/autenticacao/verificar', {
    method: 'GET',
    token
  });
}

// Funções para gerenciar usuários
export async function buscarPerfilUsuario(token) {
  return buscarApi('/api/usuarios/perfil', {
    method: 'GET',
    token
  });
}

export async function atualizarPerfilUsuario(token, dados) {
  return buscarApi('/api/usuarios/perfil', {
    method: 'PUT',
    token,
    body: dados
  });
}

// Funções para gerenciar quiz
export async function buscarQuizUsuario(token) {
  return buscarApi('/api/quiz', {
    method: 'GET',
    token
  });
}

export async function salvarQuizUsuario(token, dados) {
  return buscarApi('/api/quiz', {
    method: 'POST',
    token,
    body: dados
  });
}

export async function deletarQuizUsuario(token) {
  return buscarApi('/api/quiz', {
    method: 'DELETE',
    token
  });
}

// Funções para gerenciar refeições
export async function buscarRefeicoes(token) {
  return buscarApi('/api/refeicoes', {
    method: 'GET',
    token
  });
}

export async function salvarRefeicao(token, dados) {
  return buscarApi('/api/refeicoes', {
    method: 'POST',
    token,
    body: dados
  });
}

export async function deletarRefeicao(token, id) {
  return buscarApi(`/api/refeicoes/${id}`, {
    method: 'DELETE',
    token
  });
}

// Funções para gerenciar metas
export async function buscarMetas(token) {
  return buscarApi('/api/metas', {
    method: 'GET',
    token
  });
}

export async function salvarMetas(token, dados) {
  return buscarApi('/api/metas', {
    method: 'POST',
    token,
    body: dados
  });
}

// Gera metas nutricionais personalizadas usando IA
export async function gerarMetasNutricionais(token) {
  return buscarApi('/api/metas/gerar-ia', {
    method: 'POST',
    token,
    body: {}
  });
}

// Funções para gerenciar treinos
export async function buscarTreinos(token) {
  return buscarApi('/api/treinos', {
    method: 'GET',
    token
  });
}

export async function salvarTreino(token, dados) {
  return buscarApi('/api/treinos', {
    method: 'POST',
    token,
    body: dados
  });
}

export async function atualizarTreino(token, dados) {
  return buscarApi('/api/treinos', {
    method: 'PUT',
    token,
    body: dados
  });
}

export async function gerarPlanoTreino(token) {
  return buscarApi('/api/treinos/gerar', {
    method: 'POST',
    token,
    body: {}
  });
}

// Analisa imagem de alimento via IA
export async function analisarImagem(token, dadosImagem) {
  return buscarApi('/api/analise', {
    method: 'POST',
    token,
    body: dadosImagem
  });
}

// Verifica saúde da API
export async function verificarSaudeAPI() {
  return buscarApi('/api/saude', {
    method: 'GET'
  });
}

// Limpa dados locais do AsyncStorage
export async function limparDadosLocais() {
  try {
    await AsyncStorage.multiRemove([
      'token',
      'usuario',
      'dadosQuiz',
      'metas',
      'treinos',
      'refeicoes'
    ]);
    console.log('✅ Dados locais limpos com sucesso');
  } catch (erro) {
    console.error('❌ Erro ao limpar dados locais:', erro);
  }
}

// Realiza logout limpando dados locais
export async function fazerLogout() {
  try {
    await limparDadosLocais();
    console.log('✅ Logout realizado com sucesso');
  } catch (erro) {
    console.error('❌ Erro ao fazer logout:', erro);
  }
}

// Testa conectividade com o servidor
export async function testarConectividade() {
  try {
    const resposta = await verificarSaudeAPI();
    return {
      conectado: true,
      dados: resposta
    };
  } catch (erro) {
    return {
      conectado: false,
      erro: erro.message
    };
  }
}

// Reautentica usuário verificando token atual
export async function reautenticarUsuario(tokenAtual) {
  try {
    const dados = await verificarToken(tokenAtual);
    if (dados.valido) {
      return {
        sucesso: true,
        usuario: dados.usuario
      };
    } else {
      throw new Error('Token inválido');
    }
  } catch (erro) {
    console.error('❌ Erro na reautenticação:', erro);
    return {
      sucesso: false,
      erro: erro.message
    };
  }
}

export const testarConexao = testarConectividade;
