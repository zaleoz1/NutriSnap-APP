import express from 'express';
import bancoDados from '../config/db.js';
import { requerAutenticacao } from '../middleware/auth.js';

const roteador = express.Router();

roteador.get('/', requerAutenticacao, async (req, res) => {
  const [linhas] = await bancoDados.query('SELECT * FROM treinos WHERE id_usuario = ? ORDER BY id DESC LIMIT 1', [req.idUsuario]);
  res.json(linhas[0] || null);
});

roteador.post('/', requerAutenticacao, async (req, res) => {
  const { plano } = req.body;
  await bancoDados.query('INSERT INTO treinos (id_usuario, plano) VALUES (?, ?)', [
    req.idUsuario, JSON.stringify(plano || [])
  ]);
  res.json({ mensagem: 'Treino salvo' });
});

export default roteador;
