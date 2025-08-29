import { Platform } from 'react-native';

// Função para detectar IP automaticamente
function detectarIP() {
  // Em desenvolvimento, tentar detectar IP automaticamente
  if (__DEV__) {
    // IPs comuns para desenvolvimento
    const ipsPossiveis = [
      'http://192.168.0.135:3000',  // IP original
      'http://192.168.1.100:3000',  // IP alternativo comum
      'http://10.0.2.2:3000',       // Android Emulator
      'http://localhost:3000',       // Local
      'http://127.0.0.1:3000'       // Loopback
    ];
    
    // Por enquanto, usar o IP original
    // Em uma implementação real, você poderia fazer ping para detectar
    return ipsPossiveis[0];
  }
  
  // Em produção, usar URL de produção
  return 'https://seu-dominio.com';
}

// URL base da API
export const URL_BASE = detectarIP();

// Função principal para fazer requisições à API
export async function buscarApi(caminho, { method = 'GET', token, body, retries = 2 } = {}) {
  let ultimoErro;
  
  for (let tentativa = 0; tentativa <= retries; tentativa++) {
    try {
      const url = `${URL_BASE}${caminho}`;
      
      // Configurar cabeçalhos
      const cabecalhos = { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      if (token) {
        cabecalhos['Authorization'] = `Bearer ${token}`;
      }
      
      // Configurar opções da requisição
      const opcoes = { 
        method, 
        headers: cabecalhos,
        timeout: 15000 // Aumentado para 15 segundos
      };
      
      if (body && method !== 'GET') {
        opcoes.body = JSON.stringify(body);
      }
      
      console.log(`🌐 API Request: ${method} ${url} (tentativa ${tentativa + 1})`);
      if (body) console.log('📦 Body:', body);
      
      // Fazer requisição
      const resposta = await fetch(url, opcoes);
      
      // Verificar se a resposta é JSON
      const contentType = resposta.headers.get('content-type');
      let dados;
      
      if (contentType && contentType.includes('application/json')) {
        dados = await resposta.json();
      } else {
        dados = { mensagem: await resposta.text() };
      }
      
      // Log da resposta
      console.log(`📡 API Response: ${resposta.status} ${resposta.statusText}`);
      
      // Verificar se houve erro HTTP
      if (!resposta.ok) {
        const erro = new Error(dados.mensagem || `Erro ${resposta.status}: ${resposta.statusText}`);
        erro.status = resposta.status;
        erro.dados = dados;
        throw erro;
      }
      
      return dados;
      
    } catch (erro) {
      ultimoErro = erro;
      console.error(`❌ Erro na API (tentativa ${tentativa + 1}):`, erro.message);
      
      // Se não é a última tentativa e é um erro de rede, tentar novamente
      if (tentativa < retries && (
        erro.name === 'TypeError' && erro.message.includes('fetch') ||
        erro.message.includes('Network request failed')
      )) {
        console.log(`🔄 Tentando novamente em ${(tentativa + 1) * 1000}ms...`);
        await new Promise(resolve => setTimeout(resolve, (tentativa + 1) * 1000));
        continue;
      }
      
      // Se é a última tentativa ou não é erro de rede, parar
      break;
    }
  }
  
  // Todas as tentativas falharam
  console.error('❌ Todas as tentativas falharam');
  
  // Tratar erros específicos
  if (ultimoErro.name === 'TypeError' && ultimoErro.message.includes('fetch')) {
    throw new Error('Erro de conexão. Verifique sua internet e se o servidor está rodando.');
  }
  
  if (ultimoErro.status === 401) {
    throw new Error('Sessão expirada. Faça login novamente.');
  }
  
  if (ultimoErro.status === 403) {
    throw new Error('Acesso negado. Verifique suas permissões.');
  }
  
  if (ultimoErro.status === 404) {
    throw new Error('Recurso não encontrado.');
  }
  
  if (ultimoErro.status === 500) {
    throw new Error('Erro interno do servidor. Tente novamente mais tarde.');
  }
  
  // Erro genérico
  throw new Error(ultimoErro.message || 'Erro desconhecido na comunicação com o servidor.');
}

// Função para testar conectividade com o servidor
export async function testarConexao() {
  try {
    const resposta = await buscarApi('/api/saude');
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

// Função para verificar se o token ainda é válido
export async function verificarToken(token) {
  try {
    const resposta = await buscarApi('/api/autenticacao/verificar', { token });
    return resposta.valido;
  } catch (erro) {
    return false;
  }
}

// Função alternativa para compatibilidade
export const buscarAPI = buscarApi;

// Função para obter informações de erro detalhadas
export function obterDetalhesErro(erro) {
  if (erro.dados && erro.dados.detalhes) {
    return erro.dados.detalhes.join(', ');
  }
  return erro.message;
}
