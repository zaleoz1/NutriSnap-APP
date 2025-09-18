import bancoDados from '../config/db.js';

class WorkoutsModel {

    static async buscarUltimoPlano(idUsuario) {
        const [linhas] = await bancoDados.query(
            'SELECT * FROM treinos WHERE id_usuario = ? ORDER BY id DESC LIMIT 1',
            [idUsuario]
        );
        return linhas[0] || null;
    }

    static async salvarPlano(idUsuario, plano) {
        await bancoDados.query(
            'INSERT INTO treinos (id_usuario, plano) VALUES (?, ?)',
            [idUsuario, JSON.stringify(plano || [])]
        );
    }

    static async atualizarPlano(idUsuario, plano) {
        const [treinosExistentes] = await bancoDados.query(
            'SELECT id FROM treinos WHERE id_usuario = ? ORDER BY id DESC LIMIT 1',
            [idUsuario]
        );

        if (treinosExistentes.length > 0) {
            await bancoDados.query(
                'UPDATE treinos SET plano = ? WHERE id_usuario = ? ORDER BY id DESC LIMIT 1',
                [JSON.stringify(plano), idUsuario]
            );
        } else {
            await this.salvarPlano(idUsuario, plano);
        }
    }

    static async buscarDadosQuiz(idUsuario) {
        const [quizData] = await bancoDados.query(
            'SELECT * FROM meus_dados WHERE id_usuario = ?',
            [idUsuario]
        );
        return quizData[0] || null;
    }

    // Funções de geração do plano de treino
    static gerarPlanoTreino(dadosQuiz) {
        const {
            objetivo, nivel_atividade, frequencia_treino, acesso_academia,
            duracao_treino, metas_especificas,
            idade, sexo, peso_atual, peso_meta, horario_preferido
        } = dadosQuiz;

        const intensidade = this.determinarIntensidade(objetivo, nivel_atividade);
        const frequencia = this.determinarFrequencia(frequencia_treino);
        const tiposTreino = this.determinarTiposTreino(objetivo, metas_especificas);
        const duracao = this.determinarDuracao(duracao_treino);

        const treinos = this.gerarTreinosSemana(
            frequencia, tiposTreino, intensidade, duracao, acesso_academia, horario_preferido
        );

        return {
            usuario: { idade, sexo, peso_atual, peso_meta, objetivo, nivel_atividade },
            configuracao: { intensidade, frequencia, duracao, acesso_academia, horario_preferido },
            treinos,
            criado_em: new Date().toISOString()
        };
    }

    static determinarIntensidade(objetivo, nivelAtividade) {
        if (objetivo === 'emagrecer') return nivelAtividade === 'iniciante' ? 'média' : 'alta';
        if (objetivo === 'ganhar_massa') return nivelAtividade === 'iniciante' ? 'baixa' : 'média';
        if (objetivo === 'manter') return 'média';
        if (objetivo === 'condicionamento') return nivelAtividade === 'iniciante' ? 'baixa' : 'alta';
        return 'média';
    }

    static determinarFrequencia(frequenciaTreino) {
        const frequencias = { '1_2_vezes': 2, '3_4_vezes': 4, '5_6_vezes': 5, 'diario': 7 };
        return frequencias[frequenciaTreino] || 3;
    }

    static determinarTiposTreino(objetivo, metasEspecificas) {
        const tipos = [];
        if (objetivo === 'emagrecer') tipos.push('cardio', 'funcional');
        else if (objetivo === 'ganhar_massa') tipos.push('força', 'funcional');
        else if (objetivo === 'condicionamento') tipos.push('cardio', 'força', 'flexibilidade');
        else tipos.push('funcional', 'cardio');
        
        try {
            const metas = typeof metasEspecificas === 'string' ? JSON.parse(metasEspecificas) : metasEspecificas;
            if (metas?.resistencia) tipos.push('cardio');
            if (metas?.forca) tipos.push('força');
            if (metas?.flexibilidade) tipos.push('flexibilidade');
        } catch (e) {}

        return [...new Set(tipos)];
    }

    static determinarDuracao(duracaoTreino) {
        const duracoes = { '30_min': 30, '45_min': 45, '60_min': 60, '90_min': 90 };
        return duracoes[duracaoTreino] || 60;
    }

    static gerarTreinosSemana(frequencia, tiposTreino, intensidade, duracao, acessoAcademia, horarioPreferido) {
        const treinos = [];
        let tipoIndex = 0;
        for (let i = 0; i < frequencia; i++) {
            const dia = i + 1;
            const tipo = tiposTreino[tipoIndex % tiposTreino.length];
            const treino = this.gerarTreinoEspecifico(dia, tipo, intensidade, duracao, acessoAcademia, horarioPreferido);
            treinos.push(treino);
            tipoIndex++;
        }
        return treinos;
    }

    static gerarTreinoEspecifico(dia, tipo, intensidade, duracao, acessoAcademia, horarioPreferido) {
        return {
            dia, tipo, intensidade, duracao,
            horario: horarioPreferido || '08:00',
            nome: this.gerarNomeTreino(tipo, intensidade),
            descricao: this.gerarDescricaoTreino(tipo, duracao),
            exercicios: this.gerarExercicios(tipo, intensidade, duracao, acessoAcademia),
            concluido: false
        };
    }

    static gerarNomeTreino(tipo, intensidade) {
        const nomes = {
            cardio: { baixa: 'Cardio Leve', média: 'Cardio Moderado', alta: 'Cardio Intenso', máxima: 'Cardio Extremo' },
            força: { baixa: 'Treino de Força Básico', média: 'Treino de Força Intermediário', alta: 'Treino de Força Avançado', máxima: 'Treino de Força Elite' },
            funcional: { baixa: 'Funcional Básico', média: 'Funcional Intermediário', alta: 'Funcional Avançado', máxima: 'Funcional Elite' },
            flexibilidade: { baixa: 'Alongamento Suave', média: 'Alongamento Moderado', alta: 'Alongamento Intenso', máxima: 'Alongamento Avançado' }
        };
        return nomes[tipo]?.[intensidade] || `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} ${intensidade}`;
    }

    static gerarDescricaoTreino(tipo, duracao) {
        const descricoes = {
            cardio: `Treino cardiovascular de ${duracao} minutos focado em melhorar resistência e queima calórica.`,
            força: `Sessão de musculação de ${duracao} minutos para desenvolvimento de força e massa muscular.`,
            funcional: `Treino funcional de ${duracao} minutos que trabalha múltiplos grupos musculares simultaneamente.`,
            flexibilidade: `Sessão de alongamento e flexibilidade de ${duracao} minutos para melhorar mobilidade.`
        };
        return descricoes[tipo] || `Treino personalizado de ${duracao} minutos.`;
    }

    static gerarExercicios(tipo, intensidade, duracao, acessoAcademia) {
        const exercicios = [];
        if (tipo === 'cardio') {
            exercicios.push({ nome: 'Corrida', series: 1, repeticoes: `${duracao} min`, descricao: 'Corrida contínua para melhorar resistência cardiovascular' },
                { nome: 'Polichinelo', series: 3, repeticoes: 20, descricao: 'Exercício de coordenação e cardio' },
                { nome: 'Burpee', series: 3, repeticoes: 15, descricao: 'Exercício completo que trabalha todo o corpo' });
        } else if (tipo === 'força') {
            if (acessoAcademia === 'academia_completa') {
                exercicios.push({ nome: 'Supino Reto', series: 4, repeticoes: 12, descricao: 'Desenvolvimento de peito e tríceps' },
                    { nome: 'Agachamento com Barra', series: 4, repeticoes: 15, descricao: 'Quadríceps, glúteos e core' });
            } else {
                exercicios.push({ nome: 'Flexão de Braço', series: 3, repeticoes: 15, descricao: 'Peito, tríceps e ombros' },
                    { nome: 'Agachamento Livre', series: 4, repeticoes: 20, descricao: 'Quadríceps e glúteos' });
            }
        }
        if (intensidade === 'alta' || intensidade === 'máxima') {
            exercicios.forEach(ex => {
                if (typeof ex.repeticoes === 'number') {
                    ex.repeticoes = Math.floor(ex.repeticoes * 1.5);
                }
            });
        }
        return exercicios;
    }
}

export default WorkoutsModel;