import express from 'express';
import fetch from 'node-fetch';
import { requerAutenticacao } from '../middleware/auth.js';

const roteador = express.Router();

// Proxy seguro para análise de imagem via Gemini (mantém a chave no backend)
roteador.post('/', requerAutenticacao, async (req, res) => {
  const { dadosImagemBase64 } = req.body;
  if (!dadosImagemBase64) return res.status(400).json({ mensagem: 'Imagem ausente' });

  try {
    const chave = process.env.GEMINI_API_KEY || '';
    if (!chave) return res.status(500).json({ mensagem: 'GEMINI_API_KEY não configurada' });

    const urlApi = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${chave}`;
    const prompt = "Analise esta imagem de uma refeição. Identifique cada item e estime calorias. Responda apenas com JSON puro, sem explicações, sem blocos de código, sem texto extra. Exemplo: {\"itens\":[{\"nome\":\"Arroz\",\"calorias\":120}],\"caloriasTotais\":120}";
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
      // Tenta extrair JSON de dentro do texto
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
    res.json(dados);
  } catch (erro) {
    res.status(500).json({ mensagem: erro.message });
  }
});

export default roteador;