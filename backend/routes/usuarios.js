
/**
 * Rotas relacionadas ao usuário: perfil, atualização de dados e alteração de senha.
 * Inclui autenticação obrigatória para todas as operações.
 *
 * @module routes/usuarios
 */

import express from 'express';
import bancoDados from '../config/db.js';
import { requerAutenticacao } from '../middleware/auth.js';
import bcrypt from 'bcrypt';

// Cria um roteador Express para as rotas de usuário
const roteador = express.Router();


/**
 * GET /perfil
 * Retorna os dados do perfil do usuário autenticado, incluindo dados do quiz se existirem.
 * Requer autenticação via middleware.
 */
roteador.get('/perfil', requerAutenticacao, async (req, res) => {
  try {
    // Busca dados básicos do usuário
    const [usuarios] = await bancoDados.query(
      'SELECT id, nome, email, criado_em FROM usuarios WHERE id = ?',
      [req.idUsuario]
    );
    
    if (usuarios.length === 0) {
      // Usuário não encontrado
      return res.status(404).json({ 
        mensagem: 'Usuário não encontrado' 
      });
    }
    
    const usuario = usuarios[0];
    
    // Busca dados do quiz, se existirem, e adiciona ao objeto do usuário
    const [quizData] = await bancoDados.query(
      'SELECT idade, sexo, altura, peso_atual, peso_meta, objetivo, nivel_atividade FROM meus_dados WHERE id_usuario = ?',
      [req.idUsuario]
    );
    
    if (quizData.length > 0) {
      Object.assign(usuario, quizData[0]);
    }
    
    res.json(usuario);
  } catch (erro) {
    console.error('❌ Erro ao buscar perfil:', erro);
    res.status(500).json({ 
      mensagem: 'Erro ao buscar perfil do usuário',
      erro: erro.message 
    });
  }
});


/**
 * PUT /perfil
 * Atualiza os dados do perfil do usuário autenticado e, se necessário, os dados do quiz.
 * Requer autenticação via middleware.
 */
roteador.put('/perfil', requerAutenticacao, async (req, res) => {
  try {
    // Extrai dados do corpo da requisição
    const { nome, email, idade, sexo, altura, peso_atual, peso_meta, objetivo, nivel_atividade } = req.body;
    
    // Validação: nome e email são obrigatórios
    if (!nome || !email) {
      return res.status(400).json({ 
        mensagem: 'Nome e email são obrigatórios' 
      });
    }
    
    // Verifica se o email já está em uso por outro usuário
    if (email) {
      const [usuariosExistentes] = await bancoDados.query(
        'SELECT id FROM usuarios WHERE email = ? AND id != ?',
        [email, req.idUsuario]
      );
      
      if (usuariosExistentes.length > 0) {
        return res.status(400).json({ 
          mensagem: 'Este email já está em uso por outro usuário' 
        });
      }
    }
    
    // Atualiza dados básicos do usuário
    await bancoDados.query(
      'UPDATE usuarios SET nome = ?, email = ? WHERE id = ?',
      [nome, email, req.idUsuario]
    );
    
    // Verifica se já existem dados do quiz para este usuário
    const [quizExistente] = await bancoDados.query(
      'SELECT id FROM meus_dados WHERE id_usuario = ?',
      [req.idUsuario]
    );
    
    if (quizExistente.length > 0) {
      // Atualiza dados do quiz
      await bancoDados.query(`
        UPDATE meus_dados SET
          idade = ?, sexo = ?, altura = ?, peso_atual = ?, peso_meta = ?,
          objetivo = ?, nivel_atividade = ?, atualizado_em = CURRENT_TIMESTAMP
        WHERE id_usuario = ?
      `, [
        idade || null, sexo || null, altura || null, peso_atual || null, peso_meta || null,
        objetivo || null, nivel_atividade || null, req.idUsuario
      ]);
    } else if (idade || sexo || altura || peso_atual || peso_meta || objetivo || nivel_atividade) {
      // Insere novos dados do quiz caso não existam
      await bancoDados.query(`
        INSERT INTO meus_dados (
          id_usuario, idade, sexo, altura, peso_atual, peso_meta,
          objetivo, nivel_atividade
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        req.idUsuario, idade || null, sexo || null, altura || null, 
        peso_atual || null, peso_meta || null, objetivo || null, nivel_atividade || null
      ]);
    }
    
    console.log(`✅ Perfil atualizado para usuário ${req.idUsuario}`);
    res.json({ 
      mensagem: 'Perfil atualizado com sucesso',
      usuario: {
        id: req.idUsuario,
        nome,
        email,
        idade,
        sexo,
        altura,
        peso_atual,
        peso_meta,
        objetivo,
        nivel_atividade
      }
    });
    
  } catch (erro) {
    console.error('❌ Erro ao atualizar perfil:', erro);
    res.status(500).json({ 
      mensagem: 'Erro ao atualizar perfil do usuário',
      erro: erro.message 
    });
  }
});


/**
 * PUT /alterar-senha
 * Permite ao usuário autenticado alterar sua senha, validando a senha atual.
 * Requer autenticação via middleware.
 */
roteador.put('/alterar-senha', requerAutenticacao, async (req, res) => {
  // Extrai as senhas do corpo da requisição
  const { senhaAtual, novaSenha } = req.body;
  
  // Validação: ambas as senhas são obrigatórias
  if (!senhaAtual || !novaSenha) {
    return res.status(400).json({ mensagem: 'Senha atual e nova senha são obrigatórias.' });
  }

  try {
    // 1. Busca o hash da senha atual do banco de dados
    const [usuarios] = await bancoDados.query(
      'SELECT senha FROM usuarios WHERE id = ?',
      [req.idUsuario]
    );

    if (usuarios.length === 0) {
      // Usuário não encontrado
      return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    }

    const hashSenhaArmazenada = usuarios[0].senha;

    // 2. Compara a senha atual fornecida com o hash armazenado
    const senhaValida = await bcrypt.compare(senhaAtual, hashSenhaArmazenada);

    if (!senhaValida) {
      // Senha atual incorreta
      return res.status(401).json({ mensagem: 'Senha atual incorreta.' });
    }
    
    // 3. Criptografa a nova senha
    const saltRounds = 10;
    const novaSenhaHash = await bcrypt.hash(novaSenha, saltRounds);

    // 4. Atualiza a senha no banco de dados
    await bancoDados.query(
      'UPDATE usuarios SET senha = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?',
      [novaSenhaHash, req.idUsuario]
    );

    console.log(`✅ Senha alterada com sucesso para o usuário ${req.idUsuario}`);
    res.json({ mensagem: 'Senha alterada com sucesso!' });
    
  } catch (erro) {
    console.error('❌ Erro ao alterar a senha:', erro);
    res.status(500).json({ 
      mensagem: 'Erro ao alterar a senha do usuário.',
      erro: erro.message
    });
  }
});


// Exporta o roteador para ser utilizado no app principal
export default roteador;
