import express from 'express';
import bancoDados from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const roteador = express.Router();

const esquemaRegistro = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(6)
});

roteador.post('/registrar', async (req, res) => {
  try {
    const { nome, email, senha } = esquemaRegistro.parse(req.body);

    const [existe] = await bancoDados.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existe.length) return res.status(400).json({ mensagem: 'Email já cadastrado' });

    const senhaCriptografada = await bcrypt.hash(senha, 10);
    await bancoDados.query('INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)', [nome, email, senhaCriptografada]);
    res.json({ mensagem: 'Usuário registrado com sucesso' });
  } catch (erro) {
    res.status(400).json({ mensagem: erro.message });
  }
});

const esquemaLogin = z.object({
  email: z.string().email(),
  senha: z.string().min(6)
});

roteador.post('/entrar', async (req, res) => {
  try {
    const { email, senha } = esquemaLogin.parse(req.body);
    const [linhas] = await bancoDados.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (!linhas.length) return res.status(400).json({ mensagem: 'Usuário não encontrado' });
    const usuario = linhas[0];

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) return res.status(400).json({ mensagem: 'Senha incorreta' });

    const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET || 'secreta', { expiresIn: '7d' });
    res.json({ token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } });
  } catch (erro) {
    res.status(400).json({ mensagem: erro.message });
  }
});

export default roteador;