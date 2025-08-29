import express from 'express';
import bancoDados from '../config/db.js';
import { requerAutenticacao } from '../middleware/auth.js';

const roteador = express.Router();

// Busca metas atuais do usuário
roteador.get('/', requerAutenticacao, async (req, res) => {
  try {
    const [linhas] = await bancoDados.query('SELECT * FROM metas WHERE id_usuario = ? ORDER BY id DESC LIMIT 1', [req.idUsuario]);
    res.json(linhas[0] || null);
  } catch (erro) {
    console.error('❌ Erro ao buscar metas:', erro);
    res.status(500).json({ 
      mensagem: 'Erro ao buscar metas',
      erro: erro.message 
    });
  }
});

// Salva metas do usuário
roteador.post('/', requerAutenticacao, async (req, res) => {
  try {
    const { peso_atual, peso_meta, dias, calorias_diarias } = req.body;
    await bancoDados.query('INSERT INTO metas (id_usuario, peso_atual, peso_meta, dias, calorias_diarias) VALUES (?, ?, ?, ?, ?)', [
      req.idUsuario, peso_atual, peso_meta, dias, calorias_diarias
    ]);
    res.json({ mensagem: 'Meta salva' });
  } catch (erro) {
    console.error('❌ Erro ao salvar metas:', erro);
    res.status(500).json({ 
      mensagem: 'Erro ao salvar metas',
      erro: erro.message 
    });
  }
});

// Gera metas nutricionais inteligentes baseadas no quiz
roteador.post('/gerar-ia', requerAutenticacao, async (req, res) => {
  try {
    const [quizData] = await bancoDados.query(
      'SELECT * FROM meus_dados WHERE id_usuario = ?',
      [req.idUsuario]
    );

    if (quizData.length === 0) {
      return res.status(400).json({ 
        mensagem: 'Complete o quiz primeiro para gerar metas personalizadas' 
      });
    }

    const dadosQuiz = quizData[0];
    const metasNutricionais = gerarMetasNutricionais(dadosQuiz);
    
    await bancoDados.query(
      'INSERT INTO metas (id_usuario, peso_atual, peso_meta, dias, calorias_diarias, metas_nutricionais) VALUES (?, ?, ?, ?, ?, ?)',
      [
        req.idUsuario, 
        dadosQuiz.peso_atual || 70, 
        dadosQuiz.peso_meta || 65, 
        30,
        metasNutricionais.calorias_diarias,
        JSON.stringify(metasNutricionais)
      ]
    );

    console.log(`✅ Metas nutricionais geradas para usuário ${req.idUsuario}`);
    res.json({ 
      mensagem: 'Metas nutricionais geradas com sucesso',
      metas: metasNutricionais
    });

  } catch (erro) {
    console.error('❌ Erro ao gerar metas nutricionais:', erro);
    res.status(500).json({ 
      mensagem: 'Erro ao gerar metas nutricionais',
      erro: erro.message 
    });
  }
});

// Gera metas nutricionais inteligentes baseadas nos dados do quiz
function gerarMetasNutricionais(dadosQuiz) {
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
  } = dadosQuiz;

  // Calcula TMB (Taxa Metabólica Basal) usando fórmula de Mifflin-St Jeor
  let tmb;
  if (sexo === 'masculino') {
    tmb = 10 * peso_atual + 6.25 * altura * 100 - 5 * idade + 5;
  } else {
    tmb = 10 * peso_atual + 6.25 * altura * 100 - 5 * idade - 161;
  }

  const fatoresAtividade = {
    'sedentario': 1.2,
    'leve': 1.375,
    'moderado': 1.55,
    'ativo': 1.725,
    'muito_ativo': 1.9
  };

  const fatorAtividade = fatoresAtividade[nivel_atividade] || 1.55;
  let caloriasManutencao = tmb * fatorAtividade;

  let calorias_diarias;
  let deficit_surplus;
  
  if (objetivo === 'emagrecer') {
    deficit_surplus = -500;
    calorias_diarias = Math.round(caloriasManutencao + deficit_surplus);
  } else if (objetivo === 'ganhar_massa') {
    deficit_surplus = 300;
    calorias_diarias = Math.round(caloriasManutencao + deficit_surplus);
  } else {
    deficit_surplus = 0;
    calorias_diarias = Math.round(caloriasManutencao);
  }

  let proteinas_percentual, carboidratos_percentual, gorduras_percentual;
  
  if (objetivo === 'emagrecer') {
    proteinas_percentual = 0.35;
    carboidratos_percentual = 0.40;
    gorduras_percentual = 0.25;
  } else if (objetivo === 'ganhar_massa') {
    proteinas_percentual = 0.30;
    carboidratos_percentual = 0.50;
    gorduras_percentual = 0.20;
  } else {
    proteinas_percentual = 0.25;
    carboidratos_percentual = 0.55;
    gorduras_percentual = 0.20;
  }

  const proteinas_gramas = Math.round((calorias_diarias * proteinas_percentual) / 4);
  const carboidratos_gramas = Math.round((calorias_diarias * carboidratos_percentual) / 4);
  const gorduras_gramas = Math.round((calorias_diarias * gorduras_percentual) / 9);

  const fibras_gramas = Math.round((calorias_diarias / 1000) * 14);

  const agua_litros = Math.round((peso_atual * 0.033 + (nivel_atividade === 'ativo' ? 0.5 : 0)) * 100) / 100;

  const vitaminasMinerais = gerarRecomendacoesVitaminas(dadosQuiz);

  const horariosRefeicoes = gerarHorariosRefeicoes(horario_preferido, duracao_treino);

  const dicasPersonalizadas = gerarDicasPersonalizadas(dadosQuiz, objetivo);

  return {
    peso_atual: peso_atual || 70,
    peso_meta: peso_meta || 65,
    dias: 30,
    calorias_diarias,
    deficit_surplus,
    
    macronutrientes: {
      proteinas: {
        gramas: proteinas_gramas,
        percentual: proteinas_percentual * 100,
        fontes: ['Carnes magras', 'Ovos', 'Leguminosas', 'Laticínios', 'Suplementos']
      },
      carboidratos: {
        gramas: carboidratos_gramas,
        percentual: carboidratos_percentual * 100,
        fontes: ['Arroz integral', 'Batata doce', 'Aveia', 'Frutas', 'Pães integrais']
      },
      gorduras: {
        gramas: gorduras_gramas,
        percentual: gorduras_percentual * 100,
        fontes: ['Azeite', 'Castanhas', 'Abacate', 'Peixes gordurosos', 'Sementes']
      }
    },
    
    micronutrientes: {
      fibras: {
        gramas: fibras_gramas,
        fontes: ['Frutas', 'Vegetais', 'Grãos integrais', 'Leguminosas']
      },
      agua: {
        litros: agua_litros,
        copos: Math.round(agua_litros * 4.2)
      },
      ...vitaminasMinerais
    },
    
    estrategias: {
      frequencia_refeicoes: frequencia_treino === 'diario' ? 6 : 5,
      horarios: horariosRefeicoes,
      pre_treino: objetivo === 'ganhar_massa' ? '2-3 horas antes' : '1-2 horas antes',
      pos_treino: '30 minutos após',
      hidratacao: `Beber ${agua_litros}L de água por dia`
    },
    
    dicas: dicasPersonalizadas,
    
    ajustes: {
      restricoes_medicas: restricoes_medicas || {},
      preferencias: preferencias || {},
      habitos_alimentares: habitos_alimentares || {}
    },
    
    metas_semanais: {
      treinos: frequencia_treino === 'diario' ? 7 : parseInt(frequencia_treino.split('_')[0]),
      peso_semanal: objetivo === 'emagrecer' ? -0.5 : objetivo === 'ganhar_massa' ? 0.25 : 0,
      hidratacao_diaria: agua_litros,
      refeicoes_planejadas: 21
    },
    
    progresso_esperado: {
      primeiro_mes: {
        peso: objetivo === 'emagrecer' ? -2 : objetivo === 'ganhar_massa' ? 1 : 0,
        energia: 'Aumento significativo',
        disposicao: 'Melhora gradual'
      },
      tres_meses: {
        peso: objetivo === 'emagrecer' ? -6 : objetivo === 'ganhar_massa' ? 3 : 0,
        composicao_corporal: 'Melhora significativa',
        resistencia: 'Aumento notável'
      }
    },
    
    criado_em: new Date().toISOString(),
    atualizado_em: new Date().toISOString()
  };
}

// Gera recomendações de vitaminas e minerais baseadas no perfil
function gerarRecomendacoesVitaminas(dadosQuiz) {
  const { objetivo, nivel_atividade, dieta_atual, restricoes_medicas } = dadosQuiz;
  
  const recomendacoes = {
    vitamina_d: {
      quantidade: '15-20 mcg/dia',
      fontes: ['Exposição solar', 'Peixes gordurosos', 'Gema de ovo', 'Suplementos'],
      importancia: 'Saúde óssea e imunidade'
    },
    vitamina_c: {
      quantidade: '75-90 mg/dia',
      fontes: ['Frutas cítricas', 'Pimentões', 'Brócolis', 'Morangos'],
      importancia: 'Imunidade e recuperação muscular'
    },
    vitamina_b12: {
      quantidade: '2.4 mcg/dia',
      fontes: ['Carnes', 'Peixes', 'Ovos', 'Laticínios'],
      importancia: 'Energia e saúde nervosa'
    },
    calcio: {
      quantidade: '1000-1200 mg/dia',
      fontes: ['Laticínios', 'Vegetais verdes', 'Sardinhas', 'Tofu'],
      importancia: 'Saúde óssea e contração muscular'
    },
    ferro: {
      quantidade: objetivo === 'emagrecer' ? '18 mg/dia' : '15 mg/dia',
      fontes: ['Carnes vermelhas', 'Feijões', 'Espinafre', 'Grãos integrais'],
      importancia: 'Transporte de oxigênio e energia'
    },
    magnesio: {
      quantidade: '310-420 mg/dia',
      fontes: ['Castanhas', 'Sementes', 'Grãos integrais', 'Vegetais verdes'],
      importancia: 'Relaxamento muscular e recuperação'
    },
    zinco: {
      quantidade: '8-11 mg/dia',
      fontes: ['Carnes', 'Mariscos', 'Leguminosas', 'Sementes'],
      importancia: 'Imunidade e recuperação muscular'
    }
  };

  if (restricoes_medicas && restricoes_medicas.vegetariano) {
    recomendacoes.vitamina_b12.fontes = ['Suplementos', 'Alimentos fortificados'];
    recomendacoes.ferro.quantidade = '32 mg/dia';
  }

  if (restricoes_medicas && restricoes_medicas.lactose) {
    recomendacoes.calcio.fontes = ['Vegetais verdes', 'Sardinhas', 'Tofu', 'Leites vegetais fortificados'];
  }

  return recomendacoes;
}

// Gera horários de refeições baseados na preferência do usuário
function gerarHorariosRefeicoes(horarioPreferido, duracaoTreino) {
  const horarios = {
    'manha': {
      cafe_da_manha: '07:00',
      lanche_manha: '10:00',
      almoco: '13:00',
      lanche_tarde: '16:00',
      jantar: '19:00',
      ceia: '21:00'
    },
    'tarde': {
      cafe_da_manha: '08:00',
      lanche_manha: '11:00',
      almoco: '14:00',
      lanche_tarde: '17:00',
      jantar: '20:00',
      ceia: '22:00'
    },
    'noite': {
      cafe_da_manha: '09:00',
      lanche_manha: '12:00',
      almoco: '15:00',
      lanche_tarde: '18:00',
      jantar: '21:00',
      ceia: '23:00'
    }
  };

  return horarios[horarioPreferido] || horarios.manha;
}

// Gera dicas personalizadas baseadas no objetivo e perfil do usuário
function gerarDicasPersonalizadas(dadosQuiz, objetivo) {
  const dicas = [];

  if (objetivo === 'emagrecer') {
    dicas.push(
      'Mantenha um déficit calórico consistente de 300-500 calorias por dia',
      'Priorize alimentos ricos em proteínas para manter massa muscular',
      'Inclua fibras para aumentar saciedade',
      'Evite pular refeições para manter metabolismo ativo',
      'Combine dieta com exercícios cardiovasculares regulares'
    );
  } else if (objetivo === 'ganhar_massa') {
    dicas.push(
      'Consuma mais calorias do que gasta (superávit de 200-300 calorias)',
      'Distribua proteínas ao longo do dia (a cada 3-4 horas)',
      'Consuma carboidratos antes e após treinos',
      'Não negligencie as gorduras saudáveis',
      'Treine com intensidade para estimular crescimento muscular'
    );
  } else {
    dicas.push(
      'Mantenha o equilíbrio entre calorias ingeridas e gastas',
      'Foque na qualidade dos alimentos',
      'Mantenha atividade física regular',
      'Hidrate-se adequadamente',
      'Varie os alimentos para obter todos os nutrientes'
    );
  }

  if (dadosQuiz.nivel_atividade === 'sedentario') {
    dicas.push('Comece com atividades leves e aumente gradualmente');
  } else if (dadosQuiz.nivel_atividade === 'muito_ativo') {
    dicas.push('Atenção à recuperação e descanso adequado');
  }

  if (dadosQuiz.habitos_alimentares && dadosQuiz.habitos_alimentares.lanches) {
    dicas.push('Escolha lanches saudáveis como frutas, castanhas ou iogurte');
  }

  return dicas;
}

export default roteador;