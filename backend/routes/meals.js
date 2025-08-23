import express from 'express';
import bancoDados from '../config/db.js';
import { requerAutenticacao } from '../middleware/auth.js';

const roteador = express.Router();

roteador.get('/', requerAutenticacao, async (req, res) => {
  const [linhas] = await bancoDados.query('SELECT * FROM refeicoes WHERE id_usuario = ? ORDER BY timestamp DESC', [req.idUsuario]);
  res.json(linhas);
});

roteador.post('/', requerAutenticacao, async (req, res) => {
  const { itens, calorias_totais, timestamp } = req.body;
  await bancoDados.query('INSERT INTO refeicoes (id_usuario, itens, calorias_totais, timestamp) VALUES (?, ?, ?, ?)', [
    req.idUsuario,
    JSON.stringify(itens || []),
    calorias_totais || 0,
    timestamp || new Date()
  ]);
  res.json({ mensagem: 'Refeição salva' });
});

roteador.delete('/:id', requerAutenticacao, async (req, res) => {
  await bancoDados.query('DELETE FROM refeicoes WHERE id = ? AND id_usuario = ?', [req.params.id, req.idUsuario]);
  res.json({ mensagem: 'Refeição removida' });
});

export default roteador;