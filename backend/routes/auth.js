import express from 'express';
import bancoDados from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const roteador = express.Router();

// Esquemas de validação melhorados
const esquemaRegistro = z.object({
  nome: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  email: z.string()
    .email('Email deve ter formato válido')
    .max(100, 'Email deve ter no máximo 100 caracteres')
    .toLowerCase()
    .trim(),
  senha: z.string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(255, 'Senha muito longa')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número')
});

const esquemaLogin = z.object({
  email: z.string()
    .email('Email deve ter formato válido')
    .toLowerCase()
    .trim(),
  senha: z.string()
    .min(1, 'Senha é obrigatória')
});

// Rota de registro
roteador.post('/registrar', async (req, res) => {
  try {
    // Validar dados de entrada
    const dadosValidados = esquemaRegistro.parse(req.body);
    
    // Verificar se email já existe
    const [usuariosExistentes] = await bancoDados.query(
      'SELECT id FROM usuarios WHERE email = ?', 
      [dadosValidados.email]
    );
    
    if (usuariosExistentes.length > 0) {
      return res.status(409).json({ 
        mensagem: 'Email já está cadastrado. Use outro email ou faça login.' 
      });
    }

    // Criptografar senha
    const saltRounds = 12;
    const senhaCriptografada = await bcrypt.hash(dadosValidados.senha, saltRounds);
    
    // Inserir usuário
    const [resultado] = await bancoDados.query(
      'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
      [dadosValidados.nome, dadosValidados.email, senhaCriptografada]
    );
    
    console.log(`✅ Usuário registrado: ${dadosValidados.email} (ID: ${resultado.insertId})`);
    
    res.status(201).json({ 
      mensagem: 'Conta criada com sucesso! Faça login para continuar.',
      usuario: {
        id: resultado.insertId,
        nome: dadosValidados.nome,
        email: dadosValidados.email
      }
    });
    
  } catch (erro) {
    console.error('❌ Erro no registro:', erro);
    
    if (erro instanceof z.ZodError) {
      const mensagens = erro.errors.map(e => e.message);
      return res.status(400).json({ 
        mensagem: 'Dados inválidos',
        detalhes: mensagens 
      });
    }
    
    res.status(500).json({ 
      mensagem: 'Erro interno do servidor. Tente novamente.' 
    });
  }
});

// Rota de login
roteador.post('/entrar', async (req, res) => {
  try {
    // Validar dados de entrada
    const dadosValidados = esquemaLogin.parse(req.body);
    
    // Buscar usuário
    const [usuarios] = await bancoDados.query(
      'SELECT id, nome, email, senha FROM usuarios WHERE email = ?',
      [dadosValidados.email]
    );
    
    if (usuarios.length === 0) {
      return res.status(401).json({ 
        mensagem: 'Email ou senha incorretos' 
      });
    }
    
    const usuario = usuarios[0];
    
    // Verificar senha
    const senhaCorreta = await bcrypt.compare(dadosValidados.senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ 
        mensagem: 'Email ou senha incorretos' 
      });
    }
    
    // Gerar token JWT
    const payload = { 
      id: usuario.id, 
      email: usuario.email,
      nome: usuario.nome
    };
    
    const token = jwt.sign(
      payload, 
      process.env.JWT_SECRET || 'secreta', 
      { 
        expiresIn: '7d',
        issuer: 'nutrisnap',
        audience: 'nutrisnap-users'
      }
    );
    
    console.log(`✅ Login realizado: ${usuario.email} (ID: ${usuario.id})`);
    
    // Retornar dados do usuário (sem senha) e token
    res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      },
      mensagem: 'Login realizado com sucesso!'
    });
    
  } catch (erro) {
    console.error('❌ Erro no login:', erro);
    
    if (erro instanceof z.ZodError) {
      const mensagens = erro.errors.map(e => e.message);
      return res.status(400).json({ 
        mensagem: 'Dados inválidos',
        detalhes: mensagens 
      });
    }
    
    res.status(500).json({ 
      mensagem: 'Erro interno do servidor. Tente novamente.' 
    });
  }
});

// Rota de verificação de token (opcional)
roteador.get('/verificar', async (req, res) => {
  try {
    const cabecalho = req.headers.authorization || '';
    const token = cabecalho.startsWith('Bearer ') ? cabecalho.slice(7) : null;
    
    if (!token) {
      return res.status(401).json({ 
        mensagem: 'Token ausente',
        valido: false 
      });
    }
    
    const decodificado = jwt.verify(token, process.env.JWT_SECRET || 'secreta');
    
    // Buscar dados atualizados do usuário
    const [usuarios] = await bancoDados.query(
      'SELECT id, nome, email FROM usuarios WHERE id = ?',
      [decodificado.id]
    );
    
    if (usuarios.length === 0) {
      return res.status(401).json({ 
        mensagem: 'Usuário não encontrado',
        valido: false 
      });
    }
    
    res.json({
      valido: true,
      usuario: usuarios[0],
      mensagem: 'Token válido'
    });
    
  } catch (erro) {
    console.error('❌ Erro na verificação:', erro);
    res.status(401).json({ 
      mensagem: 'Token inválido',
      valido: false 
    });
  }
});

export default roteador;