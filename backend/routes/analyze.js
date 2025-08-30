import express from 'express';
import fetch from 'node-fetch';
import { requerAutenticacao } from '../middleware/auth.js';

const roteador = express.Router();

// Proxy seguro para análise de imagem via Gemini (mantém a chave no backend)
roteador.post('/', requerAutenticacao, async (req, res) => {
  const { dadosImagemBase64, pesoTotal, quantidadeItens, descricaoRefeicao } = req.body;
  if (!dadosImagemBase64) return res.status(400).json({ mensagem: 'Imagem ausente' });

  try {
    const chave = process.env.GEMINI_API_KEY || '';
    if (!chave) return res.status(500).json({ mensagem: 'GEMINI_API_KEY não configurada' });

    const urlApi = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${chave}`;
    
    //prompt baseado informações fornecidas
    let prompt = `Analise esta imagem de uma refeição. Identifique cada item e forneça informações nutricionais completas.

Para cada alimento identificado, estime:
- Nome do alimento
- Calorias (kcal)
- Proteínas (g)
- Carboidratos (g) 
- Gorduras (g)`;

    // Adicionar informações de peso, quantidade e descrição se fornecidas
    const informacoesAdicionais = [];
    
    if (pesoTotal) {
      informacoesAdicionais.push(`- Peso total da refeição: ${pesoTotal} gramas`);
    }
    
    if (quantidadeItens) {
      informacoesAdicionais.push(`- Quantidade de itens: ${quantidadeItens}`);
    }
    
    if (descricaoRefeicao) {
      informacoesAdicionais.push(`- Descrição da refeição: ${descricaoRefeicao}`);
    }
    
    if (informacoesAdicionais.length > 0) {
      prompt += `

INFORMAÇÕES ADICIONAIS:
${informacoesAdicionais.join('\n')}

Use essas informações para uma análise mais precisa e contextualizada. Se há quantidade de itens especificada, divida os valores nutricionais pela quantidade de itens para obter a porção individual de cada item. A descrição pode ajudar a identificar melhor os alimentos e suas preparações.`;
    }

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

    // Log das informações recebidas
    console.log('📊 Informações recebidas:', {
      pesoTotal: pesoTotal || 'Não informado',
      quantidadeItens: quantidadeItens || 'Não informado',
      descricaoRefeicao: descricaoRefeicao || 'Não informado',
      temPeso: !!pesoTotal,
      temQuantidade: !!quantidadeItens,
      temDescricao: !!descricaoRefeicao
    });

    const payload = {
      contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: 'image/jpeg', data: dadosImagemBase64 } }] }],
      generationConfig: { responseMimeType: 'application/json' }
    };

    const resposta = await fetch(urlApi, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const json = await resposta.json();

    const texto = json?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const limpo = texto.replace(/```json|```/g, '').trim();
    let dados;
    
    try {
      dados = JSON.parse(limpo);
    } catch {
      const match = limpo.match(/{[\s\S]+}/);
      if (match) {
        try {
          dados = JSON.parse(match[0]);
        } catch {
          dados = null;
        }
      } else {
        dados = null;
      }
    }

    if (!dados) return res.status(500).json({ mensagem: 'Resposta inválida do modelo' });

    if (dados.itens && Array.isArray(dados.itens)) {
      dados.itens = dados.itens.map(item => ({
        nome: item.nome || 'Alimento não identificado',
        calorias: parseFloat(item.calorias) || 0,
        proteinas: parseFloat(item.proteinas) || 0,
        carboidratos: parseFloat(item.carboidratos) || 0,
        gorduras: parseFloat(item.gorduras) || 0
      }));

      // Calcular totais sempre (mesmo se fornecidos pelo modelo)
      const caloriasTotais = dados.itens.reduce((soma, item) => soma + (item.calorias || 0), 0);
      const proteinasTotais = dados.itens.reduce((soma, item) => soma + (item.proteinas || 0), 0);
      const carboidratosTotais = dados.itens.reduce((soma, item) => soma + (item.carboidratos || 0), 0);
      const gordurasTotais = dados.itens.reduce((soma, item) => soma + (item.gorduras || 0), 0);

      // Garantir que os totais estejam sempre presentes e corretos
      dados.caloriasTotais = caloriasTotais;
      dados.proteinasTotais = proteinasTotais;
      dados.carboidratosTotais = carboidratosTotais;
      dados.gordurasTotais = gordurasTotais;

      // Log para debug
      console.log('🍎 Itens processados:', dados.itens);
      console.log('📊 Totais calculados:', {
        calorias: caloriasTotais,
        proteinas: proteinasTotais,
        carboidratos: carboidratosTotais,
        gorduras: gordurasTotais
      });
    }

    // Log final dos dados enviados
    console.log('📤 Dados enviados para o frontend:', dados);

    res.json(dados);
  } catch (erro) {
    console.error('❌ Erro na análise de imagem:', erro);
    res.status(500).json({ mensagem: erro.message });
  }
});

export default roteador;