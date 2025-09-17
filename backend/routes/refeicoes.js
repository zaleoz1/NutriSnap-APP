import express from 'express';
import bancoDados from '../config/db.js';
import { requerAutenticacao } from '../middleware/auth.js';

const roteador = express.Router();

/**
 * =============================
 * Rotas de Refeições
 * =============================
 * - GET /           → Buscar todas as refeições do usuário autenticado
 * - POST /          → Salvar uma nova refeição
 * - PUT /:id        → Atualizar refeição existente
 * - DELETE /:id     → Deletar refeição existente
 * 
 * Todas as rotas exigem autenticação (middleware requerAutenticacao).
 */

/**
 * 📌 Buscar todas as refeições do usuário autenticado
 * - Ordenadas por timestamp (mais recentes primeiro)
 */
roteador.get('/', requerAutenticacao, async (req, res) => {
  try {
    const [linhas] = await bancoDados.query(
      'SELECT * FROM refeicoes WHERE id_usuario = ? ORDER BY timestamp DESC', 
      [req.idUsuario]
    );
    
    console.log(`📋 Buscando refeições para usuário ${req.idUsuario}: ${linhas.length} encontradas`);
    res.json(linhas);
  } catch (erro) {
    console.error('❌ Erro ao buscar refeições:', erro);
    res.status(500).json({ mensagem: 'Erro ao buscar refeições', erro: erro.message });
  }
});

/**
 * 📌 Salvar uma nova refeição
 * - Recebe lista de itens, macros, tipo de refeição e observações
 * - Faz validação básica (itens obrigatórios, calorias > 0)
 * - Recalcula macros com base nos itens para consistência
 */
roteador.post('/', requerAutenticacao, async (req, res) => {
  try {
    console.log('📥 Dados recebidos para salvar refeição:', JSON.stringify(req.body, null, 2));
    
    const { 
      itens, 
      calorias_totais, 
      proteinas_totais = 0,
      carboidratos_totais = 0,
      gorduras_totais = 0,
      timestamp,
      tipo_refeicao = 'outros',
      observacoes = ''
    } = req.body;

    // ⚠️ Validações básicas
    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ mensagem: 'Lista de itens é obrigatória e deve conter pelo menos um item' });
    }
    if (!calorias_totais || calorias_totais <= 0) {
      return res.status(400).json({ mensagem: 'Calorias totais devem ser maiores que zero' });
    }

    // 🔢 Recalcular macros a partir dos itens
    let proteinas = parseFloat(proteinas_totais) || 0;
    let carboidratos = parseFloat(carboidratos_totais) || 0;
    let gorduras = parseFloat(gorduras_totais) || 0;

    const totais = itens.reduce((acc, item) => {
      acc.proteinas += parseFloat(item.proteinas || 0);
      acc.carboidratos += parseFloat(item.carboidratos || 0);
      acc.gorduras += parseFloat(item.gorduras || 0);
      return acc;
    }, { proteinas: 0, carboidratos: 0, gorduras: 0 });

    if (proteinas === 0) proteinas = totais.proteinas;
    if (carboidratos === 0) carboidratos = totais.carboidratos;
    if (gorduras === 0) gorduras = totais.gorduras;

    // ⏰ Converter timestamp
    const timestampConvertido = timestamp ? new Date(timestamp) : new Date();

    // 💾 Inserir refeição
    const [resultado] = await bancoDados.query(`
      INSERT INTO refeicoes (
        id_usuario, itens, calorias_totais, proteinas_totais, 
        carboidratos_totais, gorduras_totais, timestamp, tipo_refeicao, observacoes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.idUsuario,
      JSON.stringify(itens),
      parseFloat(calorias_totais),
      proteinas,
      carboidratos,
      gorduras,
      timestampConvertido,
      tipo_refeicao,
      observacoes
    ]);

    res.status(201).json({ 
      mensagem: 'Refeição salva com sucesso',
      id: resultado.insertId
    });

  } catch (erro) {
    console.error('❌ Erro ao salvar refeição:', erro);
    res.status(500).json({ mensagem: 'Erro ao salvar refeição', erro: erro.message });
  }
});

/**
 * 📌 Atualizar refeição existente
 * - Requer o ID da refeição na URL
 * - Só atualiza se a refeição pertencer ao usuário autenticado
 */
roteador.put('/:id', requerAutenticacao, async (req, res) => {
  try {
    const { id } = req.params;
    const { itens, calorias_totais, proteinas_totais, carboidratos_totais, gorduras_totais, tipo_refeicao, observacoes } = req.body;

    // ⚠️ Garantir que pertence ao usuário
    const [refeicaoExistente] = await bancoDados.query(
      'SELECT id FROM refeicoes WHERE id = ? AND id_usuario = ?',
      [id, req.idUsuario]
    );

    if (refeicaoExistente.length === 0) {
      return res.status(404).json({ mensagem: 'Refeição não encontrada' });
    }

    // 💾 Atualizar
    await bancoDados.query(`
      UPDATE refeicoes SET
        itens = ?, calorias_totais = ?, proteinas_totais = ?,
        carboidratos_totais = ?, gorduras_totais = ?, tipo_refeicao = ?,
        observacoes = ?, timestamp = CURRENT_TIMESTAMP
      WHERE id = ? AND id_usuario = ?
    `, [
      JSON.stringify(itens || []),
      calorias_totais || 0,
      proteinas_totais || 0,
      carboidratos_totais || 0,
      gorduras_totais || 0,
      tipo_refeicao || 'outros',
      observacoes || '',
      id,
      req.idUsuario
    ]);

    res.json({ mensagem: 'Refeição atualizada com sucesso' });

  } catch (erro) {
    console.error('❌ Erro ao atualizar refeição:', erro);
    res.status(500).json({ mensagem: 'Erro ao atualizar refeição', erro: erro.message });
  }
});

/**
 * 📌 Deletar refeição
 * - Requer o ID da refeição
 * - Só remove se for do usuário autenticado
 */
roteador.delete('/:id', requerAutenticacao, async (req, res) => {
  try {
    const { id } = req.params;

    const [refeicaoExistente] = await bancoDados.query(
      'SELECT id FROM refeicoes WHERE id = ? AND id_usuario = ?',
      [id, req.idUsuario]
    );

    if (refeicaoExistente.length === 0) {
      return res.status(404).json({ mensagem: 'Refeição não encontrada' });
    }

    await bancoDados.query(
      'DELETE FROM refeicoes WHERE id = ? AND id_usuario = ?', 
      [id, req.idUsuario]
    );

    res.json({ mensagem: 'Refeição removida com sucesso' });

  } catch (erro) {
    console.error('❌ Erro ao deletar refeição:', erro);
    res.status(500).json({ mensagem: 'Erro ao deletar refeição', erro: erro.message });
  }
});

export default roteador;
