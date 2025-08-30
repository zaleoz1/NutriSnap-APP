import express from 'express';
import bancoDados from '../config/db.js';
import { requerAutenticacao } from '../middleware/auth.js';

const roteador = express.Router();

// Buscar refeições do usuário
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
    res.status(500).json({ 
      mensagem: 'Erro ao buscar refeições',
      erro: erro.message 
    });
  }
});

// Salvar nova refeição
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

    // Validação básica
    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      console.log('❌ Validação falhou: itens inválidos');
      return res.status(400).json({ 
        mensagem: 'Lista de itens é obrigatória e deve conter pelo menos um item' 
      });
    }

    if (!calorias_totais || calorias_totais <= 0) {
      console.log('❌ Validação falhou: calorias inválidas');
      return res.status(400).json({ 
        mensagem: 'Calorias totais devem ser maiores que zero' 
      });
    }

    // Calcular totais se não fornecidos
    let proteinas = parseFloat(proteinas_totais) || 0;
    let carboidratos = parseFloat(carboidratos_totais) || 0;
    let gorduras = parseFloat(gorduras_totais) || 0;

    // Sempre recalcular totais baseado nos itens para garantir consistência
    const totais = itens.reduce((acc, item) => {
      acc.proteinas += parseFloat(item.proteinas || 0);
      acc.carboidratos += parseFloat(item.carboidratos || 0);
      acc.gorduras += parseFloat(item.gorduras || 0);
      return acc;
    }, { proteinas: 0, carboidratos: 0, gorduras: 0 });

    // Usar totais calculados se os fornecidos forem 0 ou inválidos
    if (proteinas === 0) proteinas = totais.proteinas;
    if (carboidratos === 0) carboidratos = totais.carboidratos;
    if (gorduras === 0) gorduras = totais.gorduras;

    console.log('🧮 Totais calculados:', { proteinas, carboidratos, gorduras });

    // Verificar se o usuário existe
    const [usuarioExiste] = await bancoDados.query(
      'SELECT id FROM usuarios WHERE id = ?',
      [req.idUsuario]
    );

    if (usuarioExiste.length === 0) {
      console.log('❌ Usuário não encontrado:', req.idUsuario);
      return res.status(404).json({ 
        mensagem: 'Usuário não encontrado' 
      });
    }

    console.log('✅ Usuário validado:', req.idUsuario);

    // Converter timestamp para formato compatível com MySQL
    let timestampConvertido;
    if (timestamp) {
      // Se o timestamp vem como string ISO 8601, converter para Date e depois para formato MySQL
      if (typeof timestamp === 'string') {
        timestampConvertido = new Date(timestamp);
      } else {
        timestampConvertido = new Date(timestamp);
      }
    } else {
      timestampConvertido = new Date();
    }

    // Preparar dados para inserção
    const dadosInsercao = [
      req.idUsuario,
      JSON.stringify(itens),
      parseFloat(calorias_totais),
      proteinas,
      carboidratos,
      gorduras,
      timestampConvertido,
      tipo_refeicao,
      observacoes
    ];

    console.log('💾 Dados para inserção:', dadosInsercao);

    // Inserir refeição no banco
    const [resultado] = await bancoDados.query(`
      INSERT INTO refeicoes (
        id_usuario, itens, calorias_totais, proteinas_totais, 
        carboidratos_totais, gorduras_totais, timestamp, tipo_refeicao, observacoes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, dadosInsercao);

    console.log(`✅ Refeição salva para usuário ${req.idUsuario} (ID: ${resultado.insertId})`);
    console.log(`📊 Dados: ${itens.length} itens, ${calorias_totais} kcal, ${proteinas}g proteínas`);

    res.status(201).json({ 
      mensagem: 'Refeição salva com sucesso',
      id: resultado.insertId,
      dados: {
        itens: itens.length,
        calorias: calorias_totais,
        proteinas,
        carboidratos,
        gorduras
      }
    });

  } catch (erro) {
    console.error('❌ Erro ao salvar refeição:', erro);
    console.error('❌ Stack trace:', erro.stack);
    console.error('❌ Dados que causaram o erro:', JSON.stringify(req.body, null, 2));
    
    res.status(500).json({ 
      mensagem: 'Erro ao salvar refeição',
      erro: erro.message,
      detalhes: process.env.NODE_ENV === 'development' ? erro.stack : undefined
    });
  }
});

// Atualizar refeição existente
roteador.put('/:id', requerAutenticacao, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      itens, 
      calorias_totais, 
      proteinas_totais,
      carboidratos_totais,
      gorduras_totais,
      tipo_refeicao,
      observacoes
    } = req.body;

    // Verificar se a refeição pertence ao usuário
    const [refeicaoExistente] = await bancoDados.query(
      'SELECT id FROM refeicoes WHERE id = ? AND id_usuario = ?',
      [id, req.idUsuario]
    );

    if (refeicaoExistente.length === 0) {
      return res.status(404).json({ 
        mensagem: 'Refeição não encontrada' 
      });
    }

    // Atualizar refeição
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

    console.log(`✅ Refeição ${id} atualizada para usuário ${req.idUsuario}`);
    res.json({ mensagem: 'Refeição atualizada com sucesso' });

  } catch (erro) {
    console.error('❌ Erro ao atualizar refeição:', erro);
    res.status(500).json({ 
      mensagem: 'Erro ao atualizar refeição',
      erro: erro.message 
    });
  }
});

// Deletar refeição
roteador.delete('/:id', requerAutenticacao, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se a refeição pertence ao usuário
    const [refeicaoExistente] = await bancoDados.query(
      'SELECT id FROM refeicoes WHERE id = ? AND id_usuario = ?',
      [id, req.idUsuario]
    );

    if (refeicaoExistente.length === 0) {
      return res.status(404).json({ 
        mensagem: 'Refeição não encontrada' 
      });
    }

    await bancoDados.query(
      'DELETE FROM refeicoes WHERE id = ? AND id_usuario = ?', 
      [id, req.idUsuario]
    );

    console.log(`✅ Refeição ${id} deletada para usuário ${req.idUsuario}`);
    res.json({ mensagem: 'Refeição removida com sucesso' });

  } catch (erro) {
    console.error('❌ Erro ao deletar refeição:', erro);
    res.status(500).json({ 
      mensagem: 'Erro ao deletar refeição',
      erro: erro.message 
    });
  }
});

export default roteador;