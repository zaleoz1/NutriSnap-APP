import express from 'express';
import bancoDados from '../config/db.js';
import { requerAutenticacao } from '../middleware/auth.js';

const roteador = express.Router();

// Busca perfil completo do usuário incluindo dados do quiz
roteador.get('/perfil', requerAutenticacao, async (req, res) => {
  try {
    const [usuarios] = await bancoDados.query(
      'SELECT id, nome, email, criado_em FROM usuarios WHERE id = ?',
      [req.idUsuario]
    );
    
    if (usuarios.length === 0) {
      return res.status(404).json({ 
        mensagem: 'Usuário não encontrado' 
      });
    }
    
    const usuario = usuarios[0];
    
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

// Atualiza perfil do usuário e dados do quiz
roteador.put('/perfil', requerAutenticacao, async (req, res) => {
  try {
    const { nome, email, idade, sexo, altura, peso_atual, peso_meta, objetivo, nivel_atividade } = req.body;
    
    if (!nome || !email) {
      return res.status(400).json({ 
        mensagem: 'Nome e email são obrigatórios' 
      });
    }
    
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
    
    await bancoDados.query(
      'UPDATE usuarios SET nome = ?, email = ? WHERE id = ?',
      [nome, email, req.idUsuario]
    );
    
    const [quizExistente] = await bancoDados.query(
      'SELECT id FROM meus_dados WHERE id_usuario = ?',
      [req.idUsuario]
    );
    
    if (quizExistente.length > 0) {
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

export default roteador;
