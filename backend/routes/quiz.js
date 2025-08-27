import express from 'express';
import bancoDados from '../config/db.js';
import { requerAutenticacao } from '../middleware/auth.js';

const roteador = express.Router();

// Buscar respostas do quiz do usuário
roteador.get('/', requerAutenticacao, async (req, res) => {
  try {
    const [linhas] = await bancoDados.query(
      'SELECT * FROM quiz_respostas WHERE id_usuario = ?',
      [req.idUsuario]
    );
    
    if (linhas.length === 0) {
      return res.json(null);
    }
    
    res.json(linhas[0]);
  } catch (erro) {
    console.error('❌ Erro ao buscar respostas do quiz:', erro);
    res.status(500).json({ 
      mensagem: 'Erro ao buscar respostas do quiz',
      erro: erro.message 
    });
  }
});

// Salvar ou atualizar respostas do quiz
roteador.post('/', requerAutenticacao, async (req, res) => {
  try {
    const {
      idade,
      sexo,
      altura,
      peso_atual,
      peso_meta,
      objetivo,
      nivel_atividade,
      frequencia_treino,
      acesso_academia,
      dieta_atual,
      preferencias,
      habitos_alimentares,
      restricoes_medicas,
      historico_exercicios,
      tipo_treino_preferido,
      horario_preferido,
      duracao_treino,
      metas_especificas,
      motivacao,
      obstaculos
    } = req.body;

    // Verificar se já existe resposta para este usuário
    const [existentes] = await bancoDados.query(
      'SELECT id FROM quiz_respostas WHERE id_usuario = ?',
      [req.idUsuario]
    );

    if (existentes.length > 0) {
      // Atualizar resposta existente
      await bancoDados.query(`
        UPDATE quiz_respostas SET
          idade = ?, sexo = ?, altura = ?, peso_atual = ?, peso_meta = ?,
          objetivo = ?, nivel_atividade = ?, frequencia_treino = ?, acesso_academia = ?, dieta_atual = ?,
          preferencias = ?, habitos_alimentares = ?, restricoes_medicas = ?,
          historico_exercicios = ?, tipo_treino_preferido = ?, horario_preferido = ?, duracao_treino = ?,
          metas_especificas = ?, motivacao = ?, obstaculos = ?,
          atualizado_em = CURRENT_TIMESTAMP
        WHERE id_usuario = ?
      `, [
        idade, sexo, altura, peso_atual, peso_meta,
        objetivo, nivel_atividade, frequencia_treino, acesso_academia, dieta_atual,
        JSON.stringify(preferencias || {}), JSON.stringify(habitos_alimentares || {}), JSON.stringify(restricoes_medicas || {}),
        historico_exercicios, JSON.stringify(tipo_treino_preferido || {}), horario_preferido, duracao_treino,
        JSON.stringify(metas_especificas || {}), motivacao, JSON.stringify(obstaculos || {}),
        req.idUsuario
      ]);
      
      console.log(`✅ Quiz atualizado para usuário ${req.idUsuario}`);
      res.json({ mensagem: 'Quiz atualizado com sucesso' });
    } else {
      // Inserir nova resposta
      await bancoDados.query(`
        INSERT INTO quiz_respostas (
          id_usuario, idade, sexo, altura, peso_atual, peso_meta,
          objetivo, nivel_atividade, frequencia_treino, acesso_academia, dieta_atual,
          preferencias, habitos_alimentares, restricoes_medicas,
          historico_exercicios, tipo_treino_preferido, horario_preferido, duracao_treino,
          metas_especificas, motivacao, obstaculos
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        req.idUsuario, idade, sexo, altura, peso_atual, peso_meta,
        objetivo, nivel_atividade, frequencia_treino, acesso_academia, dieta_atual,
        JSON.stringify(preferencias || {}), JSON.stringify(habitos_alimentares || {}), JSON.stringify(restricoes_medicas || {}),
        historico_exercicios, JSON.stringify(tipo_treino_preferido || {}), horario_preferido, duracao_treino,
        JSON.stringify(metas_especificas || {}), motivacao, JSON.stringify(obstaculos || {})
      ]);
      
      console.log(`✅ Quiz salvo para usuário ${req.idUsuario}`);
      res.status(201).json({ mensagem: 'Quiz salvo com sucesso' });
    }
  } catch (erro) {
    console.error('❌ Erro ao salvar quiz:', erro);
    res.status(500).json({ 
      mensagem: 'Erro ao salvar respostas do quiz',
      erro: erro.message 
    });
  }
});

// Deletar respostas do quiz
roteador.delete('/', requerAutenticacao, async (req, res) => {
  try {
    await bancoDados.query(
      'DELETE FROM quiz_respostas WHERE id_usuario = ?',
      [req.idUsuario]
    );
    
    console.log(`✅ Quiz deletado para usuário ${req.idUsuario}`);
    res.json({ mensagem: 'Quiz deletado com sucesso' });
  } catch (erro) {
    console.error('❌ Erro ao deletar quiz:', erro);
    res.status(500).json({ 
      mensagem: 'Erro ao deletar respostas do quiz',
      erro: erro.message 
    });
  }
});

export default roteador;
