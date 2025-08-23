import { Platform } from 'react-native';

// Ajuste seu IP local aqui (ou use variável de ambiente no EAS)
export const URL_BASE = 'http://192.168.0.135:3000';

export async function buscarApi(caminho, { method = 'GET', token, body } = {}) {
  const cabecalhos = { 'Content-Type': 'application/json' };
  if (token) cabecalhos['Authorization'] = `Bearer ${token}`;
  
  const resposta = await fetch(`${URL_BASE}${caminho}`, { 
    method, 
    headers: cabecalhos, 
    body: body ? JSON.stringify(body) : undefined 
  });
  
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(dados.mensagem || 'Erro na API');
  return dados;
}

// Função alternativa para compatibilidade
export const buscarAPI = buscarApi;
