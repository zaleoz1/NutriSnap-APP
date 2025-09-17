
/**
 * Rotas relacionadas ao plano de treino do usuário.
 * Inclui endpoints para buscar, salvar, atualizar e gerar planos personalizados.
 *
 * @module routes/workouts
 */

import express from 'express';
import bancoDados from '../config/db.js';
import { requerAutenticacao } from '../middleware/auth.js';

// Cria um roteador Express para as rotas de treinos
const roteador = express.Router();


/**
 * GET /
 * Busca o plano de treino mais recente do usuário autenticado.
 * Requer autenticação via middleware.
 */
roteador.get('/', requerAutenticacao, async (req, res) => {
  try {
    // Busca o último plano de treino cadastrado para o usuário
    const [linhas] = await bancoDados.query(
      'SELECT * FROM treinos WHERE id_usuario = ? ORDER BY id DESC LIMIT 1', 
      [req.idUsuario]
    );
    res.json(linhas[0] || null);
  } catch (erro) {
    console.error('❌ Erro ao buscar treinos:', erro);
    res.status(500).json({ 
      mensagem: 'Erro ao buscar treinos',
      erro: erro.message 
    });
  }
});


/**
 * POST /
 * Salva um novo plano de treino para o usuário autenticado.
 * Espera no corpo: plano (array de treinos).
 * Requer autenticação via middleware.
 */
roteador.post('/', requerAutenticacao, async (req, res) => {
  try {
    const { plano } = req.body;
    // Insere novo plano de treino no banco de dados
    await bancoDados.query(
      'INSERT INTO treinos (id_usuario, plano) VALUES (?, ?)', 
      [req.idUsuario, JSON.stringify(plano || [])]
    );
    res.json({ mensagem: 'Treino salvo com sucesso' });
  } catch (erro) {
    console.error('❌ Erro ao salvar treino:', erro);
    res.status(500).json({ 
      mensagem: 'Erro ao salvar treino',
      erro: erro.message 
    });
  }
});


/**
 * POST /gerar
 * Gera um plano de treino personalizado com base nos dados do quiz do usuário.
 * Salva o plano gerado no banco e retorna para o cliente.
 * Requer autenticação via middleware.
 */
roteador.post('/gerar', requerAutenticacao, async (req, res) => {
  try {
    // Busca os dados do quiz preenchido pelo usuário
    const [quizData] = await bancoDados.query(
      'SELECT * FROM meus_dados WHERE id_usuario = ?',
      [req.idUsuario]
    );

    // Se não houver quiz preenchido, retorna erro
    if (quizData.length === 0) {
      return res.status(400).json({ 
        mensagem: 'Complete o quiz primeiro para gerar um plano personalizado' 
      });
    }

    const dadosQuiz = quizData[0];
    
    // Gera plano de treino personalizado a partir dos dados do quiz
    const plano = gerarPlanoTreino(dadosQuiz);
    
    // Salva o plano gerado no banco de dados
    await bancoDados.query(
      'INSERT INTO treinos (id_usuario, plano) VALUES (?, ?)',
      [req.idUsuario, JSON.stringify(plano)]
    );

    console.log(`✅ Plano de treino gerado para usuário ${req.idUsuario}`);
    res.json({ 
      mensagem: 'Plano de treino gerado com sucesso',
      plano: plano
    });

  } catch (erro) {
    console.error('❌ Erro ao gerar plano de treino:', erro);
    res.status(500).json({ 
      mensagem: 'Erro ao gerar plano de treino',
      erro: erro.message 
    });
  }
});


/**
 * PUT /
 * Atualiza o plano de treino mais recente do usuário autenticado.
 * Espera no corpo: plano (array de treinos).
 * Requer autenticação via middleware.
 */
roteador.put('/', requerAutenticacao, async (req, res) => {
  try {
    const { plano } = req.body;
    
    // Verifica se já existe um plano de treino para o usuário
    const [treinosExistentes] = await bancoDados.query(
      'SELECT id FROM treinos WHERE id_usuario = ? ORDER BY id DESC LIMIT 1',
      [req.idUsuario]
    );

    if (treinosExistentes.length > 0) {
      // Atualiza o plano existente
      await bancoDados.query(
        'UPDATE treinos SET plano = ? WHERE id_usuario = ? ORDER BY id DESC LIMIT 1',
        [JSON.stringify(plano), req.idUsuario]
      );
    } else {
      // Cria novo plano caso não exista
      await bancoDados.query(
        'INSERT INTO treinos (id_usuario, plano) VALUES (?, ?)',
        [req.idUsuario, JSON.stringify(plano)]
      );
    }

    res.json({ mensagem: 'Plano atualizado com sucesso' });
  } catch (erro) {
    console.error('❌ Erro ao atualizar treino:', erro);
    res.status(500).json({ 
      mensagem: 'Erro ao atualizar treino',
      erro: erro.message 
    });
  }
});


/**
 * Função utilitária para gerar um plano de treino personalizado a partir dos dados do quiz do usuário.
 * Calcula intensidade, frequência, tipos de treino, duração e gera os treinos da semana.
 * @param {Object} dadosQuiz - Dados do quiz preenchido pelo usuário.
 * @returns {Object} Objeto com plano de treino detalhado.
 */
function gerarPlanoTreino(dadosQuiz) {
  // Desestruturação dos dados do quiz
  const {
    idade,
    sexo,
    peso_atual,
    peso_meta,
    objetivo,
    nivel_atividade,
    frequencia_treino,
    acesso_academia,
    tipo_treino_preferido,
    horario_preferido,
    duracao_treino,
    metas_especificas
  } = dadosQuiz;

  // Determina intensidade baseada no objetivo e nível de atividade
  const intensidade = determinarIntensidade(objetivo, nivel_atividade);
  // Determina frequência de treinos
  const frequencia = determinarFrequencia(frequencia_treino);
  // Determina tipos de treino baseados no objetivo e metas específicas
  const tiposTreino = determinarTiposTreino(objetivo, metas_especificas);
  // Determina duração baseada na preferência
  const duracao = determinarDuracao(duracao_treino);
  // Gera treinos para a semana
  const treinos = gerarTreinosSemana(
    frequencia,
    tiposTreino,
    intensidade,
    duracao,
    acesso_academia,
    horario_preferido
  );

  // Retorna objeto completo de plano de treino
  return {
    usuario: {
      idade,
      sexo,
      peso_atual,
      peso_meta,
      objetivo,
      nivel_atividade
    },
    configuracao: {
      intensidade,
      frequencia,
      duracao,
      acesso_academia,
      horario_preferido
    },
    treinos: treinos,
    criado_em: new Date().toISOString(),
    atualizado_em: new Date().toISOString()
  };
}


/**
 * Determina a intensidade do treino com base no objetivo e nível de atividade do usuário.
 * @param {string} objetivo - Objetivo principal do usuário.
 * @param {string} nivelAtividade - Nível de atividade do usuário.
 * @returns {string} Intensidade sugerida.
 */
function determinarIntensidade(objetivo, nivelAtividade) {
  if (objetivo === 'emagrecer') {
    return nivelAtividade === 'iniciante' ? 'média' : 'alta';
  } else if (objetivo === 'ganhar_massa') {
    return nivelAtividade === 'iniciante' ? 'baixa' : 'média';
  } else if (objetivo === 'manter') {
    return 'média';
  } else if (objetivo === 'condicionamento') {
    return nivelAtividade === 'iniciante' ? 'baixa' : 'alta';
  }
  return 'média';
}


/**
 * Determina a frequência semanal de treinos com base na resposta do quiz.
 * @param {string} frequenciaTreino - Frequência informada no quiz.
 * @returns {number} Número de treinos por semana.
 */
function determinarFrequencia(frequenciaTreino) {
  const frequencias = {
    '1_2_vezes': 2,
    '3_4_vezes': 4,
    '5_6_vezes': 5,
    'diario': 7
  };
  return frequencias[frequenciaTreino] || 3;
}


/**
 * Determina os tipos de treino sugeridos com base no objetivo e metas específicas do usuário.
 * @param {string} objetivo - Objetivo principal do usuário.
 * @param {Object|string} metasEspecificas - Metas específicas do quiz.
 * @returns {Array} Lista de tipos de treino.
 */
function determinarTiposTreino(objetivo, metasEspecificas) {
  const tipos = [];
  
  if (objetivo === 'emagrecer') {
    tipos.push('cardio', 'funcional');
  } else if (objetivo === 'ganhar_massa') {
    tipos.push('força', 'funcional');
  } else if (objetivo === 'condicionamento') {
    tipos.push('cardio', 'força', 'flexibilidade');
  } else {
    tipos.push('funcional', 'cardio');
  }

  // Adiciona tipos baseados em metas específicas do usuário
  if (metasEspecificas) {
    try {
      const metas = typeof metasEspecificas === 'string' ? JSON.parse(metasEspecificas) : metasEspecificas;
      if (metas.resistencia) tipos.push('cardio');
      if (metas.forca) tipos.push('força');
      if (metas.flexibilidade) tipos.push('flexibilidade');
    } catch (e) {
      console.log('Erro ao parsear metas específicas:', e);
    }
  }

  return [...new Set(tipos)]; // Remove duplicatas
}


/**
 * Determina a duração do treino em minutos com base na resposta do quiz.
 * @param {string} duracaoTreino - Duração informada no quiz.
 * @returns {number} Duração em minutos.
 */
function determinarDuracao(duracaoTreino) {
  const duracoes = {
    '30_min': 30,
    '45_min': 45,
    '60_min': 60,
    '90_min': 90
  };
  return duracoes[duracaoTreino] || 60;
}


/**
 * Gera os treinos da semana distribuindo os tipos de treino de forma equilibrada.
 * @param {number} frequencia - Número de treinos por semana.
 * @param {Array} tiposTreino - Tipos de treino sugeridos.
 * @param {string} intensidade - Intensidade sugerida.
 * @param {number} duracao - Duração de cada treino.
 * @param {string} acessoAcademia - Tipo de acesso à academia.
 * @param {string} horarioPreferido - Horário preferido do usuário.
 * @returns {Array} Lista de treinos da semana.
 */
function gerarTreinosSemana(frequencia, tiposTreino, intensidade, duracao, acessoAcademia, horarioPreferido) {
  const treinos = [];
  // Distribui tipos de treino ao longo da semana
  let tipoIndex = 0;
  for (let i = 0; i < frequencia; i++) {
    const dia = i + 1; // Dia da semana (1 = Segunda, 2 = Terça, ...)
    const tipo = tiposTreino[tipoIndex % tiposTreino.length];
    const treino = gerarTreinoEspecifico(
      dia,
      tipo,
      intensidade,
      duracao,
      acessoAcademia,
      horarioPreferido
    );
    treinos.push(treino);
    tipoIndex++;
  }
  return treinos;
}


/**
 * Gera um treino específico para um dia da semana.
 * @param {number} dia - Dia da semana.
 * @param {string} tipo - Tipo de treino.
 * @param {string} intensidade - Intensidade sugerida.
 * @param {number} duracao - Duração do treino.
 * @param {string} acessoAcademia - Tipo de acesso à academia.
 * @param {string} horarioPreferido - Horário preferido do usuário.
 * @returns {Object} Objeto de treino detalhado.
 */
function gerarTreinoEspecifico(dia, tipo, intensidade, duracao, acessoAcademia, horarioPreferido) {
  const treino = {
    dia: dia,
    tipo: tipo,
    intensidade: intensidade,
    duracao: duracao,
    horario: horarioPreferido || '08:00',
    nome: gerarNomeTreino(tipo, intensidade),
    descricao: gerarDescricaoTreino(tipo, intensidade, duracao),
    exercicios: gerarExercicios(tipo, intensidade, duracao, acessoAcademia),
    concluido: false
  };
  return treino;
}


/**
 * Gera o nome do treino de acordo com o tipo e intensidade.
 * @param {string} tipo - Tipo de treino.
 * @param {string} intensidade - Intensidade sugerida.
 * @returns {string} Nome do treino.
 */
function gerarNomeTreino(tipo, intensidade) {
  const nomes = {
    cardio: {
      baixa: 'Cardio Leve',
      média: 'Cardio Moderado',
      alta: 'Cardio Intenso',
      máxima: 'Cardio Extremo'
    },
    força: {
      baixa: 'Treino de Força Básico',
      média: 'Treino de Força Intermediário',
      alta: 'Treino de Força Avançado',
      máxima: 'Treino de Força Elite'
    },
    funcional: {
      baixa: 'Funcional Básico',
      média: 'Funcional Intermediário',
      alta: 'Funcional Avançado',
      máxima: 'Funcional Elite'
    },
    flexibilidade: {
      baixa: 'Alongamento Suave',
      média: 'Alongamento Moderado',
      alta: 'Alongamento Intenso',
      máxima: 'Alongamento Avançado'
    }
  };
  return nomes[tipo]?.[intensidade] || `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} ${intensidade}`;
}


/**
 * Gera a descrição do treino de acordo com o tipo e duração.
 * @param {string} tipo - Tipo de treino.
 * @param {string} intensidade - Intensidade sugerida.
 * @param {number} duracao - Duração do treino.
 * @returns {string} Descrição do treino.
 */
function gerarDescricaoTreino(tipo, intensidade, duracao) {
  const descricoes = {
    cardio: `Treino cardiovascular de ${duracao} minutos focado em melhorar resistência e queima calórica.`,
    força: `Sessão de musculação de ${duracao} minutos para desenvolvimento de força e massa muscular.`,
    funcional: `Treino funcional de ${duracao} minutos que trabalha múltiplos grupos musculares simultaneamente.`,
    flexibilidade: `Sessão de alongamento e flexibilidade de ${duracao} minutos para melhorar mobilidade.`
  };
  return descricoes[tipo] || `Treino personalizado de ${duracao} minutos.`;
}


/**
 * Gera a lista de exercícios para um treino de acordo com o tipo, intensidade e acesso à academia.
 * @param {string} tipo - Tipo de treino.
 * @param {string} intensidade - Intensidade sugerida.
 * @param {number} duracao - Duração do treino.
 * @param {string} acessoAcademia - Tipo de acesso à academia.
 * @returns {Array} Lista de exercícios.
 */
function gerarExercicios(tipo, intensidade, duracao, acessoAcademia) {
  const exercicios = [];
  // Define exercícios conforme o tipo de treino
  if (tipo === 'cardio') {
    exercicios.push(
      { nome: 'Corrida', series: 1, repeticoes: `${duracao} min`, descricao: 'Corrida contínua para melhorar resistência cardiovascular' },
      { nome: 'Polichinelo', series: 3, repeticoes: 20, descricao: 'Exercício de coordenação e cardio' },
      { nome: 'Burpee', series: 3, repeticoes: 15, descricao: 'Exercício completo que trabalha todo o corpo' },
      { nome: 'Mountain Climber', series: 3, repeticoes: 30, descricao: 'Cardio dinâmico com foco no core' },
      { nome: 'Pular Corda', series: 2, repeticoes: '2 min', descricao: 'Cardio de alta intensidade' }
    );
  } else if (tipo === 'força') {
    if (acessoAcademia === 'academia_completa') {
      exercicios.push(
        { nome: 'Supino Reto', series: 4, repeticoes: 12, descricao: 'Desenvolvimento de peito e tríceps' },
        { nome: 'Agachamento com Barra', series: 4, repeticoes: 15, descricao: 'Quadríceps, glúteos e core' },
        { nome: 'Levantamento Terra', series: 3, repeticoes: 10, descricao: 'Posterior da coxa e core' },
        { nome: 'Desenvolvimento Militar', series: 3, repeticoes: 12, descricao: 'Ombros e tríceps' },
        { nome: 'Remada Curvada', series: 3, repeticoes: 12, descricao: 'Costas e bíceps' }
      );
    } else {
      exercicios.push(
        { nome: 'Flexão de Braço', series: 3, repeticoes: 15, descricao: 'Peito, tríceps e ombros' },
        { nome: 'Agachamento Livre', series: 4, repeticoes: 20, descricao: 'Quadríceps e glúteos' },
        { nome: 'Prancha', series: 3, repeticoes: '30s', descricao: 'Core e estabilização' },
        { nome: 'Flexão Diamante', series: 3, repeticoes: 12, descricao: 'Tríceps e peito' },
        { nome: 'Agachamento com Salto', series: 3, repeticoes: 15, descricao: 'Potência e força explosiva' }
      );
    }
  } else if (tipo === 'funcional') {
    exercicios.push(
      { nome: 'Mountain Climber', series: 3, repeticoes: 30, descricao: 'Cardio e core dinâmico' },
      { nome: 'Agachamento com Salto', series: 3, repeticoes: 15, descricao: 'Potência e força explosiva' },
      { nome: 'Flexão com Rotação', series: 3, repeticoes: 12, descricao: 'Peito, core e estabilização' },
      { nome: 'Burpee', series: 3, repeticoes: 15, descricao: 'Exercício completo funcional' },
      { nome: 'Prancha com Movimento', series: 3, repeticoes: '20s', descricao: 'Core estático e dinâmico' }
    );
  } else if (tipo === 'flexibilidade') {
    exercicios.push(
      { nome: 'Alongamento de Isquiotibiais', series: 3, repeticoes: '30s', descricao: 'Posterior da coxa e flexibilidade' },
      { nome: 'Alongamento de Quadríceps', series: 3, repeticoes: '30s', descricao: 'Frente da coxa e mobilidade' },
      { nome: 'Alongamento de Ombro', series: 3, repeticoes: '30s', descricao: 'Mobilidade de ombro e peito' },
      { nome: 'Alongamento de Panturrilha', series: 3, repeticoes: '30s', descricao: 'Panturrilha e tornozelo' },
      { nome: 'Alongamento de Coluna', series: 3, repeticoes: '30s', descricao: 'Mobilidade da coluna vertebral' }
    );
  }
  // Ajusta repetições baseado na intensidade
  if (intensidade === 'alta' || intensidade === 'máxima') {
    exercicios.forEach(ex => {
      if (ex.repeticoes !== '30s' && ex.repeticoes !== '2 min' && ex.repeticoes !== '20s') {
        ex.repeticoes = Math.floor(parseInt(ex.repeticoes) * 1.5);
      }
    });
  }
  return exercicios;
}


// Exporta o roteador para ser utilizado no app principal
export default roteador;
