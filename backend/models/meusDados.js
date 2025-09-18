import bancoDados from '../config/db.js';

class MeusDadosModel {

    /**
     * Busca as respostas do quiz do usuário pelo ID.
     * @param {number} idUsuario - ID do usuário.
     * @returns {Promise<object|null>} Respostas do quiz ou null.
     */
    static async buscarDados(idUsuario) {
        const [linhas] = await bancoDados.query(
            'SELECT * FROM meus_dados WHERE id_usuario = ?',
            [idUsuario]
        );
        return linhas[0] || null;
    }

    /**
     * Salva as respostas do quiz, fazendo um INSERT ou UPDATE.
     * @param {number} idUsuario - ID do usuário.
     * @param {object} dadosQuiz - Dados do quiz.
     */
    static async salvarOuAtualizar(idUsuario, dadosQuiz) {
        const existente = await this.buscarDados(idUsuario);

        const dadosParaQuery = [
            dadosQuiz.idade || null, dadosQuiz.sexo || null, dadosQuiz.altura || null,
            dadosQuiz.peso_atual || null, dadosQuiz.peso_meta || null, dadosQuiz.objetivo || null,
            dadosQuiz.nivel_atividade || null, dadosQuiz.frequencia_treino || null,
            dadosQuiz.acesso_academia || null, dadosQuiz.dieta_atual || null,
            JSON.stringify(dadosQuiz.preferencias || {}), JSON.stringify(dadosQuiz.habitos_alimentares || {}),
            JSON.stringify(dadosQuiz.restricoes_medicas || {}), dadosQuiz.historico_exercicios || null,
            JSON.stringify(dadosQuiz.tipo_treino_preferido || {}), dadosQuiz.horario_preferido || null,
            dadosQuiz.duracao_treino || null, JSON.stringify(dadosQuiz.metas_especificas || {}),
            dadosQuiz.motivacao || null, JSON.stringify(dadosQuiz.obstaculos || {})
        ];

        if (existente) {
            await bancoDados.query(`
                UPDATE meus_dados SET
                idade = ?, sexo = ?, altura = ?, peso_atual = ?, peso_meta = ?,
                objetivo = ?, nivel_atividade = ?, frequencia_treino = ?, acesso_academia = ?, dieta_atual = ?,
                preferencias = ?, habitos_alimentares = ?, restricoes_medicas = ?,
                historico_exercicios = ?, tipo_treino_preferido = ?, horario_preferido = ?, duracao_treino = ?,
                metas_especificas = ?, motivacao = ?, obstaculos = ?,
                atualizado_em = CURRENT_TIMESTAMP
                WHERE id_usuario = ?
            `, [...dadosParaQuery, idUsuario]);
            return 'atualizado';
        } else {
            await bancoDados.query(`
                INSERT INTO meus_dados (
                id_usuario, idade, sexo, altura, peso_atual, peso_meta,
                objetivo, nivel_atividade, frequencia_treino, acesso_academia, dieta_atual,
                preferencias, habitos_alimentares, restricoes_medicas,
                historico_exercicios, tipo_treino_preferido, horario_preferido, duracao_treino,
                metas_especificas, motivacao, obstaculos
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [idUsuario, ...dadosParaQuery]);
            return 'salvo';
        }
    }

    /**
     * Deleta as respostas do quiz do usuário.
     * @param {number} idUsuario - ID do usuário.
     */
    static async deletarDados(idUsuario) {
        await bancoDados.query(
            'DELETE FROM meus_dados WHERE id_usuario = ?',
            [idUsuario]
        );
    }
}

export default MeusDadosModel;