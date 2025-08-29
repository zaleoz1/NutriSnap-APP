import express from 'express';
import bancoDados from '../config/db.js';
import { requerAutenticacao } from '../middleware/auth.js';

const roteador = express.Router();

// Busca plano de treino atual do usuário
roteador.get('/', requerAutenticacao, async (req, res) => {
  try {
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

// Salva plano de treino
roteador.post('/', requerAutenticacao, async (req, res) => {
  try {
    const { plano } = req.body;
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

// Gera plano de treino personalizado baseado no quiz
roteador.post('/gerar', requerAutenticacao, async (req, res) => {
  try {
    const [quizData] = await bancoDados.query(
      'SELECT * FROM meus_dados WHERE id_usuario = ?',
      [req.idUsuario]
    );

    if (quizData.length === 0) {
      return res.status(400).json({ 
        mensagem: 'Complete o quiz primeiro para gerar um plano personalizado' 
      });
    }

    const dadosQuiz = quizData[0];
    const plano = gerarPlanoTreino(dadosQuiz);
    
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

// Atualiza plano de treino existente
roteador.put('/', requerAutenticacao, async (req, res) => {
  try {
    const { plano } = req.body;
    
    const [treinosExistentes] = await bancoDados.query(
      'SELECT id FROM treinos WHERE id_usuario = ? ORDER BY id DESC LIMIT 1',
      [req.idUsuario]
    );

    if (treinosExistentes.length > 0) {
      await bancoDados.query(
        'UPDATE treinos SET plano = ? WHERE id_usuario = ? ORDER BY id DESC LIMIT 1',
        [JSON.stringify(plano), req.idUsuario]
      );
    } else {
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

// Gera plano de treino personalizado baseado nos dados do quiz
function gerarPlanoTreino(dadosQuiz) {
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

  const intensidade = determinarIntensidade(objetivo, nivel_atividade);
  const frequencia = determinarFrequencia(frequencia_treino);
  const tiposTreino = determinarTiposTreino(objetivo, metas_especificas);
  const duracao = determinarDuracao(duracao_treino);
  
  const treinos = gerarTreinosSemana(
    frequencia,
    tiposTreino,
    intensidade,
    duracao,
    acesso_academia,
    horario_preferido
  );

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

// Determina intensidade do treino baseada no objetivo e nível de atividade
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

// Converte frequência de treino em número de dias
function determinarFrequencia(frequenciaTreino) {
  const frequencias = {
    '1_2_vezes': 2,
    '3_4_vezes': 4,
    '5_6_vezes': 5,
    'diario': 7
  };
  return frequencias[frequenciaTreino] || 3;
}

// Determina tipos de treino baseados no objetivo
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

  return [...new Set(tipos)];
}

// Converte duração de treino em minutos
function determinarDuracao(duracaoTreino) {
  const duracoes = {
    '30_min': 30,
    '45_min': 45,
    '60_min': 60,
    '90_min': 90
  };
  return duracoes[duracaoTreino] || 60;
}

// Gera treinos para a semana baseado na frequência
function gerarTreinosSemana(frequencia, tiposTreino, intensidade, duracao, acessoAcademia, horarioPreferido) {
  const treinos = [];
  let tipoIndex = 0;
  
  for (let i = 0; i < frequencia; i++) {
    const dia = i + 1;
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

// Gera treino específico para um dia
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

// Gera nome descritivo para o treino
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

// Gera descrição do treino
function gerarDescricaoTreino(tipo, intensidade, duracao) {
  const descricoes = {
    cardio: `Treino cardiovascular de ${duracao} minutos focado em melhorar resistência e queima calórica.`,
    força: `Sessão de musculação de ${duracao} minutos para desenvolvimento de força e massa muscular.`,
    funcional: `Treino funcional de ${duracao} minutos que trabalha múltiplos grupos musculares simultaneamente.`,
    flexibilidade: `Sessão de alongamento e flexibilidade de ${duracao} minutos para melhorar mobilidade.`
  };
  
  return descricoes[tipo] || `Treino personalizado de ${duracao} minutos.`;
}

// Gera lista de exercícios baseada no tipo de treino
function gerarExercicios(tipo, intensidade, duracao, acessoAcademia) {
  const exercicios = [];
  
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
  
  if (intensidade === 'alta' || intensidade === 'máxima') {
    exercicios.forEach(ex => {
      if (ex.repeticoes !== '30s' && ex.repeticoes !== '2 min' && ex.repeticoes !== '20s') {
        ex.repeticoes = Math.floor(parseInt(ex.repeticoes) * 1.5);
      }
    });
  }
  
  return exercicios;
}

export default roteador;
