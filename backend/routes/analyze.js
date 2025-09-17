/**
 * Roteador para análise de imagens de refeições usando a API Gemini (Google Generative Language).
 * 
 * Fluxo:
 * 1. Recebe uma requisição POST com a imagem em Base64 e informações adicionais (peso, quantidade de itens, descrição).
 * 2. Monta um prompt detalhado para análise nutricional.
 * 3. Envia a imagem + prompt para a API Gemini.
 * 4. Processa a resposta JSON do modelo e garante consistência nos dados.
 * 5. Retorna os resultados para o frontend.
 * 
 * Middleware usado:
 * - requerAutenticacao → garante que apenas usuários autenticados possam usar essa rota.
 */

import express from 'express';
import fetch from 'node-fetch';
import { requerAutenticacao } from '../middleware/auth.js';

const roteador = express.Router();

/**
 * @route POST /
 * @description Analisa uma refeição a partir de uma imagem em Base64.
 * @access Privado (requer autenticação)
 * @param {string} dadosImagemBase64 - Imagem em formato Base64 (obrigatório).
 * @param {number} [pesoTotal] - Peso total da refeição em gramas.
 * @param {number} [quantidadeItens] - Quantidade de itens esperados na refeição.
 * @param {string} [descricaoRefeicao] - Descrição textual da refeição (ex: "Arroz, frango e salada").
 * @returns {Object} JSON com lista de itens identificados e totais nutricionais.
 */
roteador.post('/', requerAutenticacao, async (req, res) => {
  const { dadosImagemBase64, pesoTotal, quantidadeItens, descricaoRefeicao } = req.body;

  // Validação inicial: a imagem é obrigatória
  if (!dadosImagemBase64) {
    return res.status(400).json({ mensagem: 'Imagem ausente' });
  }

  try {
    // Recupera chave da API Gemini do .env
    const chave = process.env.GEMINI_API_KEY || '';
    if (!chave) {
      return res.status(500).json({ mensagem: 'GEMINI_API_KEY não configurada' });
    }

    // Endpoint da API Gemini
    const urlApi = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${chave}`;
    
    /**
     * Construção do prompt inicial
     * - O modelo deve identificar os itens da refeição e fornecer informações nutricionais.
     */
    let prompt = `Analise esta imagem de uma refeição. Identifique cada item e forneça informações nutricionais completas.

Para cada alimento identificado, estime:
- Nome do alimento
- Calorias (kcal)
- Proteínas (g)
- Carboidratos (g) 
- Gorduras (g)`;

    // Monta informações adicionais para refinar a análise
    const informacoesAdicionais = [];
    if (pesoTotal) informacoesAdicionais.push(`- Peso total da refeição: ${pesoTotal} gramas`);
    if (quantidadeItens) informacoesAdicionais.push(`- Quantidade de itens: ${quantidadeItens}`);
    if (descricaoRefeicao) informacoesAdicionais.push(`- Descrição da refeição: ${descricaoRefeicao}`);

    if (informacoesAdicionais.length > 0) {
      prompt += `

INFORMAÇÕES ADICIONAIS:
${informacoesAdicionais.join('\n')}

Use essas informações para uma análise mais precisa e contextualizada. 
Se há quantidade de itens especificada, divida os valores nutricionais pela quantidade de itens para obter a porção individual de cada item. 
A descrição pode ajudar a identificar melhor os alimentos e suas preparações.`;
    }

    // Reforço do formato esperado: resposta em JSON puro
    prompt += `

Responda APENAS com JSON puro, sem explicações, sem blocos de código, sem texto extra.

Formato esperado:
{
  "itens": [
    {
      "nome": "Arroz Integral",
      "calorias": 120,
      "proteinas": 2.5,
      "carboidratos": 25.0,
      "gorduras": 0.8
    }
  ],
  "caloriasTotais": 120,
  "proteinasTotais": 2.5,
  "carboidratosTotais": 25.0,
  "gordurasTotais": 0.8
}

IMPORTANTE: Sempre inclua todos os campos nutricionais para cada item. Se não conseguir estimar algum valor, use 0.`;

    // Log das informações recebidas (debug)
    console.log('📊 Informações recebidas:', {
      pesoTotal: pesoTotal || 'Não informado',
      quantidadeItens: quantidadeItens || 'Não informado',
      descricaoRefeicao: descricaoRefeicao || 'Não informado'
    });

    // Payload enviado para a API Gemini
    const payload = {
      contents: [
        {
          parts: [
            { text: prompt },
            { inlineData: { mimeType: 'image/jpeg', data: dadosImagemBase64 } }
          ]
        }
      ],
      generationConfig: { responseMimeType: 'application/json' }
    };

    // Chamada à API Gemini
    const resposta = await fetch(urlApi, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = await resposta.json();

    // Extração segura do texto retornado
    const texto = json?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const limpo = texto.replace(/```json|```/g, '').trim();

    let dados;
    try {
      dados = JSON.parse(limpo);
    } catch {
      // Tentativa de recuperar JSON válido dentro do texto
      const match = limpo.match(/{[\s\S]+}/);
      dados = match ? JSON.parse(match[0]) : null;
    }

    if (!dados) {
      return res.status(500).json({ mensagem: 'Resposta inválida do modelo' });
    }

    // Normalização dos itens e cálculo dos totais
    if (dados.itens && Array.isArray(dados.itens)) {
      dados.itens = dados.itens.map(item => ({
        nome: item.nome || 'Alimento não identificado',
        calorias: parseFloat(item.calorias) || 0,
        proteinas: parseFloat(item.proteinas) || 0,
        carboidratos: parseFloat(item.carboidratos) || 0,
        gorduras: parseFloat(item.gorduras) || 0
      }));

      // Recalcula totais para garantir consistência
      const caloriasTotais = dados.itens.reduce((soma, item) => soma + item.calorias, 0);
      const proteinasTotais = dados.itens.reduce((soma, item) => soma + item.proteinas, 0);
      const carboidratosTotais = dados.itens.reduce((soma, item) => soma + item.carboidratos, 0);
      const gordurasTotais = dados.itens.reduce((soma, item) => soma + item.gorduras, 0);

      dados.caloriasTotais = caloriasTotais;
      dados.proteinasTotais = proteinasTotais;
      dados.carboidratosTotais = carboidratosTotais;
      dados.gordurasTotais = gordurasTotais;

      // Logs de debug
      console.log('🍎 Itens processados:', dados.itens);
      console.log('📊 Totais calculados:', {
        calorias: caloriasTotais,
        proteinas: proteinasTotais,
        carboidratos: carboidratosTotais,
        gorduras: gordurasTotais
      });
    }

    // Log final dos dados enviados ao frontend
    console.log('📤 Dados enviados para o frontend:', dados);

    // Retorno final
    res.json(dados);

  } catch (erro) {
    // Captura de erro inesperado
    console.error('❌ Erro na análise de imagem:', erro);
    res.status(500).json({ mensagem: erro.message });
  }
});

export default roteador;
