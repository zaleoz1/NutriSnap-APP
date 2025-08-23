import express from 'express';
import bancoDados from '../config/db.js';
import { requerAutenticacao } from '../middleware/auth.js';

const roteador = express.Router();

roteador.get('/', requerAutenticacao, async (req, res) => {
  const [linhas] = await bancoDados.query('SELECT * FROM metas WHERE id_usuario = ? ORDER BY id DESC LIMIT 1', [req.idUsuario]);
  res.json(linhas[0] || null);
});

roteador.post('/', requerAutenticacao, async (req, res) => {
  const { peso_atual, peso_meta, dias, calorias_diarias } = req.body;
  await bancoDados.query('INSERT INTO metas (id_usuario, peso_atual, peso_meta, dias, calorias_diarias) VALUES (?, ?, ?, ?, ?)', [
    req.idUsuario, peso_atual, peso_meta, dias, calorias_diarias
  ]);
  res.json({ mensagem: 'Meta salva' });
});

export default roteador;