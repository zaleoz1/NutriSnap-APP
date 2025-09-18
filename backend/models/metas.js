import bancoDados from '../config/db.js';

class MetasModel {

    static async buscarUltimaMeta(idUsuario) {
        const [linhas] = await bancoDados.query(
            'SELECT * FROM metas WHERE id_usuario = ? ORDER BY id DESC LIMIT 1',
            [idUsuario]
        );
        return linhas[0] || null;
    }

    static async salvarMeta(idUsuario, dadosMeta) {
        const { peso_atual, peso_meta, dias, calorias_diarias } = dadosMeta;
        await bancoDados.query(
            'INSERT INTO metas (id_usuario, peso_atual, peso_meta, dias, calorias_diarias) VALUES (?, ?, ?, ?, ?)',
            [idUsuario, peso_atual, peso_meta, dias, calorias_diarias]
        );
    }

    static async salvarMetaComQuiz(idUsuario, dadosQuiz, metasNutricionais) {
        await bancoDados.query(
            'INSERT INTO metas (id_usuario, peso_atual, peso_meta, dias, calorias_diarias, metas_nutricionais) VALUES (?, ?, ?, ?, ?, ?)',
            [
                idUsuario,
                dadosQuiz.peso_atual || 70,
                dadosQuiz.peso_meta || 65,
                30,
                metasNutricionais.calorias_diarias,
                JSON.stringify(metasNutricionais)
            ]
        );
    }

    static async atualizarMeta(idUsuario, dadosMeta) {
        const { peso_atual, peso_meta, dias, calorias_diarias, metas_nutricionais } = dadosMeta;
        await bancoDados.query(
            'UPDATE metas SET peso_atual = ?, peso_meta = ?, dias = ?, calorias_diarias = ?, metas_nutricionais = ? WHERE id_usuario = ? ORDER BY id DESC LIMIT 1',
            [peso_atual, peso_meta, dias, calorias_diarias, metas_nutricionais ? JSON.stringify(metas_nutricionais) : null, idUsuario]
        );
    }

    static async buscarDadosQuiz(idUsuario) {
        const [quizData] = await bancoDados.query(
            'SELECT * FROM meus_dados WHERE id_usuario = ?',
            [idUsuario]
        );
        return quizData[0] || null;
    }

    // Lógica para gerar metas nutricionais (funções de cálculo)
    static gerarMetasNutricionais(dadosQuiz) {
        const {
            idade, sexo, altura, peso_atual, objetivo, nivel_atividade,
            frequencia_treino, horario_preferido, restricoes_medicas
        } = dadosQuiz;

        // TMB (Taxa Metabólica Basal)
        let tmb;
        if (sexo === 'masculino') {
            tmb = 10 * peso_atual + 6.25 * altura * 100 - 5 * idade + 5;
        } else {
            tmb = 10 * peso_atual + 6.25 * altura * 100 - 5 * idade - 161;
        }

        // Fator de atividade
        const fatoresAtividade = { 'sedentario': 1.2, 'leve': 1.375, 'moderado': 1.55, 'ativo': 1.725, 'muito_ativo': 1.9 };
        const fatorAtividade = fatoresAtividade[nivel_atividade] || 1.55;
        const caloriasManutencao = tmb * fatorAtividade;

        // Ajuste calórico
        let deficit_surplus;
        if (objetivo === 'emagrecer') {
            deficit_surplus = -500;
        } else if (objetivo === 'ganhar_massa') {
            deficit_surplus = 300;
        } else {
            deficit_surplus = 0;
        }
        const calorias_diarias = Math.round(caloriasManutencao + deficit_surplus);

        // Distribuição de macronutrientes
        let proteinas_percentual, carboidratos_percentual, gorduras_percentual;
        if (objetivo === 'emagrecer') {
            [proteinas_percentual, carboidratos_percentual, gorduras_percentual] = [0.35, 0.40, 0.25];
        } else if (objetivo === 'ganhar_massa') {
            [proteinas_percentual, carboidratos_percentual, gorduras_percentual] = [0.30, 0.50, 0.20];
        } else {
            [proteinas_percentual, carboidratos_percentual, gorduras_percentual] = [0.25, 0.55, 0.20];
        }

        const proteinas_gramas = Math.round((calorias_diarias * proteinas_percentual) / 4);
        const carboidratos_gramas = Math.round((calorias_diarias * carboidratos_percentual) / 4);
        const gorduras_gramas = Math.round((calorias_diarias * gorduras_percentual) / 9);
        const fibras_gramas = Math.round((calorias_diarias / 1000) * 14);
        const agua_litros = Math.round((peso_atual * 0.033) * 100) / 100;

        const vitaminasMinerais = this.gerarRecomendacoesVitaminas(dadosQuiz);
        const horariosRefeicoes = this.gerarHorariosRefeicoes(horario_preferido);
        const dicasPersonalizadas = this.gerarDicasPersonalizadas(dadosQuiz, objetivo);

        return {
            peso_atual: dadosQuiz.peso_atual || 70,
            peso_meta: dadosQuiz.peso_meta || 65,
            dias: 30,
            calorias_diarias,
            macronutrientes: {
                proteinas: { gramas: proteinas_gramas, percentual: proteinas_percentual * 100 },
                carboidratos: { gramas: carboidratos_gramas, percentual: carboidratos_percentual * 100 },
                gorduras: { gramas: gorduras_gramas, percentual: gorduras_percentual * 100 }
            },
            micronutrientes: {
                fibras: { gramas: fibras_gramas },
                agua: { litros: agua_litros },
                ...vitaminasMinerais
            },
            dicas: dicasPersonalizadas,
            horarios: horariosRefeicoes
        };
    }

    static gerarRecomendacoesVitaminas(dadosQuiz) {
        const { objetivo, restricoes_medicas } = dadosQuiz;
        const recomendacoes = {
            vitamina_b12: { fontes: ['Carnes', 'Peixes', 'Ovos', 'Laticínios'] },
            ferro: { quantidade: objetivo === 'emagrecer' ? '18 mg/dia' : '15 mg/dia', fontes: ['Carnes vermelhas', 'Feijões'] },
            calcio: { fontes: ['Laticínios', 'Vegetais verdes'] },
        };

        if (restricoes_medicas?.vegetariano) {
            recomendacoes.vitamina_b12.fontes = ['Suplementos', 'Alimentos fortificados'];
            recomendacoes.ferro.quantidade = '32 mg/dia';
        }

        if (restricoes_medicas?.lactose) {
            recomendacoes.calcio.fontes = ['Vegetais verdes', 'Sardinhas', 'Tofu', 'Leites vegetais fortificados'];
        }

        return recomendacoes;
    }

    static gerarHorariosRefeicoes(horarioPreferido) {
        const horarios = {
            'manha': { cafe_da_manha: '07:00', almoco: '13:00', jantar: '19:00' },
            'tarde': { cafe_da_manha: '08:00', almoco: '14:00', jantar: '20:00' },
            'noite': { cafe_da_manha: '09:00', almoco: '15:00', jantar: '21:00' }
        };
        return horarios[horarioPreferido] || horarios.manha;
    }

    static gerarDicasPersonalizadas(dadosQuiz, objetivo) {
        const dicas = [];
        if (objetivo === 'emagrecer') {
            dicas.push('Mantenha um déficit calórico consistente.', 'Priorize proteínas e fibras.');
        } else if (objetivo === 'ganhar_massa') {
            dicas.push('Consuma mais calorias do que gasta.', 'Distribua proteínas ao longo do dia.');
        }
        if (dadosQuiz.nivel_atividade === 'sedentario') {
            dicas.push('Comece com atividades leves e aumente gradualmente.');
        }
        return dicas;
    }
}

export default MetasModel;