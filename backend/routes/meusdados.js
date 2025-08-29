import express from 'express';
import bancoDados from '../config/db.js';
import { requerAutenticacao } from '../middleware/auth.js';

const roteador = express.Router();

// Busca respostas do quiz do usuário
roteador.get('/', requerAutenticacao, async (req, res) => {
  try {
    const [linhas] = await bancoDados.query(
      'SELECT * FROM meus_dados WHERE id_usuario = ?',
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

// Salva ou atualiza respostas do quiz
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

    const [existentes] = await bancoDados.query(
      'SELECT id FROM meus_dados WHERE id_usuario = ?',
      [req.idUsuario]
    );

    console.log(`🔍 Verificando quiz para usuário ${req.idUsuario}: ${existentes.length > 0 ? 'EXISTE' : 'NÃO EXISTE'}`);

    if (existentes.length > 0) {
      console.log(`📝 Fazendo UPDATE do quiz existente para usuário ${req.idUsuario}`);
      
      const dadosParaAtualizar = [
        idade || null, 
        sexo || null, 
        altura || null, 
        peso_atual || null, 
        peso_meta || null,
        objetivo || null, 
        nivel_atividade || null, 
        frequencia_treino || null, 
        acesso_academia || null, 
        dieta_atual || null,
        JSON.stringify(preferencias || {}), 
        JSON.stringify(habitos_alimentares || {}), 
        JSON.stringify(restricoes_medicas || {}),
        historico_exercicios || null, 
        JSON.stringify(tipo_treino_preferido || {}), 
        horario_preferido || null, 
        duracao_treino || null,
        JSON.stringify(metas_especificas || {}), 
        motivacao || null, 
        JSON.stringify(obstaculos || {}),
        req.idUsuario
      ];

      await bancoDados.query(`
        UPDATE meus_dados SET
          idade = ?, sexo = ?, altura = ?, peso_atual = ?, peso_meta = ?,
          objetivo = ?, nivel_atividade = ?, frequencia_treino = ?, acesso_academia = ?, dieta_atual = ?,
          preferencias = ?, habitos_alimentares = ?, restricoes_medicas = ?,
          historico_exercicios = ?, tipo_treino_preferido = ?, horario_preferido = ?, duracao_treino = ?,
          metas_especificas = ?, motivacao = ?, obstaculos = ?,
          atualizado_em = CURRENT_TIMESTAMP
        WHERE id_usuario = ?
      `, dadosParaAtualizar);
      
      console.log(`✅ Quiz atualizado para usuário ${req.idUsuario}`);
      res.json({ mensagem: 'Quiz atualizado com sucesso' });
    } else {
      console.log(`🆕 Fazendo INSERT de novo quiz para usuário ${req.idUsuario}`);
      
      const dadosParaInserir = [
        req.idUsuario, 
        idade || null, 
        sexo || null, 
        altura || null, 
        peso_atual || null, 
        peso_meta || null,
        objetivo || null, 
        nivel_atividade || null, 
        frequencia_treino || null, 
        acesso_academia || null, 
        dieta_atual || null,
        JSON.stringify(preferencias || {}), 
        JSON.stringify(habitos_alimentares || {}), 
        JSON.stringify(restricoes_medicas || {}),
        historico_exercicios || null, 
        JSON.stringify(tipo_treino_preferido || {}), 
        horario_preferido || null, 
        duracao_treino || null,
        JSON.stringify(metas_especificas || {}), 
        motivacao || null, 
        JSON.stringify(obstaculos || {})
      ];

      await bancoDados.query(`
        INSERT INTO meus_dados (
          id_usuario, idade, sexo, altura, peso_atual, peso_meta,
          objetivo, nivel_atividade, frequencia_treino, acesso_academia, dieta_atual,
          preferencias, habitos_alimentares, restricoes_medicas,
          historico_exercicios, tipo_treino_preferido, horario_preferido, duracao_treino,
          metas_especificas, motivacao, obstaculos
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, dadosParaInserir);
      
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

// Deleta respostas do quiz
roteador.delete('/', requerAutenticacao, async (req, res) => {
  try {
    await bancoDados.query(
      'DELETE FROM meus_dados WHERE id_usuario = ?',
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
