
/**
 * Rotas relacionadas às metas nutricionais dos usuários.
 * Inclui endpoints para buscar, salvar, atualizar e gerar metas inteligentes baseadas em dados do quiz.
 *
 * @module routes/metas
 */

import express from 'express';
import bancoDados from '../config/db.js';
import { requerAutenticacao } from '../middleware/auth.js';

// Cria um roteador Express para as rotas de metas
const roteador = express.Router();


/**
 * GET /
 * Busca a meta mais recente do usuário autenticado.
 * Requer autenticação via middleware.
 */
roteador.get('/', requerAutenticacao, async (req, res) => {
  try {
    // Busca a última meta cadastrada para o usuário
    const [linhas] = await bancoDados.query(
      'SELECT * FROM metas WHERE id_usuario = ? ORDER BY id DESC LIMIT 1',
      [req.idUsuario]
    );
    res.json(linhas[0] || null);
  } catch (erro) {
    console.error('❌ Erro ao buscar metas:', erro);
    res.status(500).json({ 
      mensagem: 'Erro ao buscar metas',
      erro: erro.message 
    });
  }
});


/**
 * POST /
 * Salva uma nova meta para o usuário autenticado.
 * Espera no corpo: peso_atual, peso_meta, dias, calorias_diarias.
 * Requer autenticação via middleware.
 */
roteador.post('/', requerAutenticacao, async (req, res) => {
  try {
    const { peso_atual, peso_meta, dias, calorias_diarias } = req.body;
    // Insere nova meta no banco de dados
    await bancoDados.query(
      'INSERT INTO metas (id_usuario, peso_atual, peso_meta, dias, calorias_diarias) VALUES (?, ?, ?, ?, ?)',
      [req.idUsuario, peso_atual, peso_meta, dias, calorias_diarias]
    );
    res.json({ mensagem: 'Meta salva' });
  } catch (erro) {
    console.error('❌ Erro ao salvar metas:', erro);
    res.status(500).json({ 
      mensagem: 'Erro ao salvar metas',
      erro: erro.message 
    });
  }
});


/**
 * POST /gerar-ia
 * Gera metas nutricionais inteligentes com base nos dados do quiz do usuário.
 * Salva as metas geradas no banco e retorna para o cliente.
 * Requer autenticação via middleware.
 */
roteador.post('/gerar-ia', requerAutenticacao, async (req, res) => {
  try {
    // Busca os dados do quiz preenchido pelo usuário
    const [quizData] = await bancoDados.query(
      'SELECT * FROM meus_dados WHERE id_usuario = ?',
      [req.idUsuario]
    );

    // Se não houver quiz preenchido, retorna erro
    if (quizData.length === 0) {
      return res.status(400).json({ 
        mensagem: 'Complete o quiz primeiro para gerar metas personalizadas' 
      });
    }

    const dadosQuiz = quizData[0];
    
    // Gera metas nutricionais personalizadas a partir dos dados do quiz
    const metasNutricionais = gerarMetasNutricionais(dadosQuiz);
    
    // Salva as metas geradas no banco de dados
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


/**
 * PUT /atualizar
 * Atualiza a meta mais recente do usuário autenticado.
 * Espera no corpo: peso_atual, peso_meta, dias, calorias_diarias, metas_nutricionais.
 * Requer autenticação via middleware.
 */
roteador.put('/atualizar', requerAutenticacao, async (req, res) => {
  try {
    const { peso_atual, peso_meta, dias, calorias_diarias, metas_nutricionais } = req.body;
    // Atualiza a meta mais recente do usuário no banco de dados
    const [result] = await bancoDados.query(
      'UPDATE metas SET peso_atual = ?, peso_meta = ?, dias = ?, calorias_diarias = ?, metas_nutricionais = ? WHERE id_usuario = ? ORDER BY id DESC LIMIT 1',
      [peso_atual, peso_meta, dias, calorias_diarias, metas_nutricionais ? JSON.stringify(metas_nutricionais) : null, req.idUsuario]
    );
    res.json({ mensagem: 'Meta atualizada com sucesso!' });
  } catch (erro) {
    console.error('❌ Erro ao atualizar metas:', erro);
    res.status(500).json({
      mensagem: 'Erro ao atualizar metas',
      erro: erro.message
    });
  }
});


/**
 * Função utilitária para gerar metas nutricionais inteligentes a partir dos dados do quiz do usuário.
 * Calcula calorias, macronutrientes, micronutrientes, estratégias e dicas personalizadas.
 * @param {Object} dadosQuiz - Dados do quiz preenchido pelo usuário.
 * @returns {Object} Objeto com metas nutricionais detalhadas.
 */
function gerarMetasNutricionais(dadosQuiz) {
  // Desestruturação dos dados do quiz
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

  // Calcula a Taxa Metabólica Basal (TMB) usando a equação de Harris-Benedict
  let tmb;
  if (sexo === 'masculino') {
    tmb = 10 * peso_atual + 6.25 * altura * 100 - 5 * idade + 5;
  } else {
    tmb = 10 * peso_atual + 6.25 * altura * 100 - 5 * idade - 161;
  }

  // Define o fator de atividade conforme o nível informado
  const fatoresAtividade = {
    'sedentario': 1.2,
    'leve': 1.375,
    'moderado': 1.55,
    'ativo': 1.725,
    'muito_ativo': 1.9
  };
  const fatorAtividade = fatoresAtividade[nivel_atividade] || 1.55;
  let caloriasManutencao = tmb * fatorAtividade;

  // Ajusta as calorias diárias conforme o objetivo do usuário
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

  // Define a distribuição de macronutrientes conforme o objetivo
  let proteinas_percentual, carboidratos_percentual, gorduras_percentual;
  if (objetivo === 'emagrecer') {
    proteinas_percentual = 0.35; // 35% proteínas
    carboidratos_percentual = 0.40; // 40% carboidratos
    gorduras_percentual = 0.25; // 25% gorduras
  } else if (objetivo === 'ganhar_massa') {
    proteinas_percentual = 0.30; // 30% proteínas
    carboidratos_percentual = 0.50; // 50% carboidratos
    gorduras_percentual = 0.20; // 20% gorduras
  } else {
    proteinas_percentual = 0.25; // 25% proteínas
    carboidratos_percentual = 0.55; // 55% carboidratos
    gorduras_percentual = 0.20; // 20% gorduras
  }

  // Calcula a quantidade em gramas de cada macronutriente
  const proteinas_gramas = Math.round((calorias_diarias * proteinas_percentual) / 4); // 1g proteína = 4kcal
  const carboidratos_gramas = Math.round((calorias_diarias * carboidratos_percentual) / 4); // 1g carbo = 4kcal
  const gorduras_gramas = Math.round((calorias_diarias * gorduras_percentual) / 9); // 1g gordura = 9kcal

  // Calcula fibras (14g por 1000 calorias)
  const fibras_gramas = Math.round((calorias_diarias / 1000) * 14);

  // Calcula recomendação de água (litros) baseada no peso e nível de atividade
  const agua_litros = Math.round((peso_atual * 0.033 + (nivel_atividade === 'ativo' ? 0.5 : 0)) * 100) / 100;

  // Gera recomendações de vitaminas e minerais
  const vitaminasMinerais = gerarRecomendacoesVitaminas(dadosQuiz);

  // Gera horários de refeições sugeridos
  const horariosRefeicoes = gerarHorariosRefeicoes(horario_preferido, duracao_treino);

  // Gera dicas personalizadas para o perfil do usuário
  const dicasPersonalizadas = gerarDicasPersonalizadas(dadosQuiz, objetivo);

  // Retorna objeto completo de metas nutricionais
  return {
    // Metas básicas
    peso_atual: peso_atual || 70,
    peso_meta: peso_meta || 65,
    dias: 30,
    calorias_diarias,
    deficit_surplus,
    
    // Macronutrientes
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
    
    // Micronutrientes
    micronutrientes: {
      fibras: {
        gramas: fibras_gramas,
        fontes: ['Frutas', 'Vegetais', 'Grãos integrais', 'Leguminosas']
      },
      agua: {
        litros: agua_litros,
        copos: Math.round(agua_litros * 4.2) // Aproximação de copos de 240ml
      },
      ...vitaminasMinerais
    },
    
    // Estratégias nutricionais
    estrategias: {
      frequencia_refeicoes: frequencia_treino === 'diario' ? 6 : 5,
      horarios: horariosRefeicoes,
      pre_treino: objetivo === 'ganhar_massa' ? '2-3 horas antes' : '1-2 horas antes',
      pos_treino: '30 minutos após',
      hidratacao: `Beber ${agua_litros}L de água por dia`
    },
    
    // Dicas personalizadas
    dicas: dicasPersonalizadas,
    
    // Ajustes baseados em restrições e preferências
    ajustes: {
      restricoes_medicas: restricoes_medicas || {},
      preferencias: preferencias || {},
      habitos_alimentares: habitos_alimentares || {}
    },
    
    // Metas semanais
    metas_semanais: {
      treinos: frequencia_treino === 'diario' ? 7 : parseInt(frequencia_treino.split('_')[0]),
      peso_semanal: objetivo === 'emagrecer' ? -0.5 : objetivo === 'ganhar_massa' ? 0.25 : 0,
      hidratacao_diaria: agua_litros,
      refeicoes_planejadas: 21
    },
    
    // Progresso esperado
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
    
    // Datas de criação e atualização
    criado_em: new Date().toISOString(),
    atualizado_em: new Date().toISOString()
  };
}


/**
 * Gera recomendações de vitaminas e minerais com base no perfil e restrições do usuário.
 * @param {Object} dadosQuiz - Dados do quiz preenchido pelo usuário.
 * @returns {Object} Objeto com recomendações de micronutrientes.
 */
function gerarRecomendacoesVitaminas(dadosQuiz) {
  const { objetivo, nivel_atividade, dieta_atual, restricoes_medicas } = dadosQuiz;
  
  // Recomendações padrão de vitaminas e minerais
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

  // Ajusta recomendações caso o usuário seja vegetariano
  if (restricoes_medicas && restricoes_medicas.vegetariano) {
    recomendacoes.vitamina_b12.fontes = ['Suplementos', 'Alimentos fortificados'];
    recomendacoes.ferro.quantidade = '32 mg/dia'; // Maior necessidade para vegetarianos
  }

  // Ajusta recomendações caso o usuário tenha restrição à lactose
  if (restricoes_medicas && restricoes_medicas.lactose) {
    recomendacoes.calcio.fontes = ['Vegetais verdes', 'Sardinhas', 'Tofu', 'Leites vegetais fortificados'];
  }

  return recomendacoes;
}


/**
 * Gera horários de refeições sugeridos conforme o horário preferido do usuário.
 * @param {string} horarioPreferido - Período do dia preferido ('manha', 'tarde', 'noite').
 * @param {string|number} duracaoTreino - Duração do treino (não utilizado atualmente).
 * @returns {Object} Objeto com horários sugeridos para cada refeição.
 */
function gerarHorariosRefeicoes(horarioPreferido, duracaoTreino) {
  // Horários padrão para cada período do dia
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

  // Retorna os horários conforme preferência, ou padrão manhã
  return horarios[horarioPreferido] || horarios.manha;
}


/**
 * Gera dicas personalizadas de acordo com o objetivo, nível de atividade e hábitos do usuário.
 * @param {Object} dadosQuiz - Dados do quiz preenchido pelo usuário.
 * @param {string} objetivo - Objetivo principal do usuário ('emagrecer', 'ganhar_massa', etc).
 * @returns {Array} Lista de dicas personalizadas.
 */
function gerarDicasPersonalizadas(dadosQuiz, objetivo) {
  const dicas = [];

  // Dicas conforme objetivo
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

  // Dicas adicionais conforme nível de atividade
  if (dadosQuiz.nivel_atividade === 'sedentario') {
    dicas.push('Comece com atividades leves e aumente gradualmente');
  } else if (dadosQuiz.nivel_atividade === 'muito_ativo') {
    dicas.push('Atenção à recuperação e descanso adequado');
  }

  // Dicas conforme hábitos alimentares
  if (dadosQuiz.habitos_alimentares && dadosQuiz.habitos_alimentares.lanches) {
    dicas.push('Escolha lanches saudáveis como frutas, castanhas ou iogurte');
  }

  return dicas;
}


// Exporta o roteador para ser utilizado no app principal
export default roteador;