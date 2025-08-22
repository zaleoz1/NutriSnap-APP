import express from 'express';
import fetch from 'node-fetch';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Proxy seguro para análise de imagem via Gemini (mantém a chave no backend)
router.post('/', requireAuth, async (req, res) => {
  const { base64ImageData } = req.body;
  if (!base64ImageData) return res.status(400).json({ message: 'Imagem ausente' });

  try {
    const key = process.env.GEMINI_API_KEY || '';
    if (!key) return res.status(500).json({ message: 'GEMINI_API_KEY não configurada' });

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${key}`;
    const prompt = "Analise esta imagem de uma refeição. Identifique cada item e estime calorias. Responda com JSON: {items:[{name, calories}], totalCalories}";
    const payload = {
      contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: 'image/jpeg', data: base64ImageData } }] }],
      generationConfig: { responseMimeType: 'application/json' }
    };

    const r = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const json = await r.json();

    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleaned = text.replace(/```json|```/g, '').trim();
    let data;
    try { data = JSON.parse(cleaned); } catch { data = null; }

    if (!data) return res.status(500).json({ message: 'Resposta inválida do modelo' });
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
