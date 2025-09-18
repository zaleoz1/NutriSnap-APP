import bancoDados from '../config/db.js';

class RefeicoesModel {

    /**
     * Busca todas as refeições de um usuário.
     * @param {number} idUsuario - ID do usuário.
     * @returns {Promise<Array>} Lista de refeições.
     */
    static async buscarTodas(idUsuario) {
        const [linhas] = await bancoDados.query(
            'SELECT * FROM refeicoes WHERE id_usuario = ? ORDER BY timestamp DESC',
            [idUsuario]
        );
        return linhas;
    }

    /**
     * Salva uma nova refeição no banco de dados.
     * @param {number} idUsuario - ID do usuário.
     * @param {object} dadosRefeicao - Dados da refeição a ser salva.
     * @returns {Promise<number>} O ID da refeição salva.
     */
    static async salvar(idUsuario, dadosRefeicao) {
        // Recálculo de macros
        const totais = dadosRefeicao.itens.reduce((acc, item) => {
            acc.proteinas += parseFloat(item.proteinas || 0);
            acc.carboidratos += parseFloat(item.carboidratos || 0);
            acc.gorduras += parseFloat(item.gorduras || 0);
            return acc;
        }, { proteinas: 0, carboidratos: 0, gorduras: 0 });

        const {
            itens,
            calorias_totais,
            timestamp,
            tipo_refeicao = 'outros',
            observacoes = ''
        } = dadosRefeicao;

        const proteinas = parseFloat(dadosRefeicao.proteinas_totais || totais.proteinas);
        const carboidratos = parseFloat(dadosRefeicao.carboidratos_totais || totais.carboidratos);
        const gorduras = parseFloat(dadosRefeicao.gorduras_totais || totais.gorduras);
        const timestampConvertido = timestamp ? new Date(timestamp) : new Date();

        const [resultado] = await bancoDados.query(`
            INSERT INTO refeicoes (
            id_usuario, itens, calorias_totais, proteinas_totais,
            carboidratos_totais, gorduras_totais, timestamp, tipo_refeicao, observacoes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            idUsuario,
            JSON.stringify(itens),
            parseFloat(calorias_totais),
            proteinas,
            carboidratos,
            gorduras,
            timestampConvertido,
            tipo_refeicao,
            observacoes
        ]);

        return resultado.insertId;
    }

    /**
     * Atualiza uma refeição existente.
     * @param {number} idRefeicao - ID da refeição a ser atualizada.
     * @param {number} idUsuario - ID do usuário.
     * @param {object} dadosAtualizacao - Novos dados da refeição.
     */
    static async atualizar(idRefeicao, idUsuario, dadosAtualizacao) {
        await bancoDados.query(`
            UPDATE refeicoes SET
            itens = ?, calorias_totais = ?, proteinas_totais = ?,
            carboidratos_totais = ?, gorduras_totais = ?, tipo_refeicao = ?,
            observacoes = ?, timestamp = CURRENT_TIMESTAMP
            WHERE id = ? AND id_usuario = ?
        `, [
            JSON.stringify(dadosAtualizacao.itens || []),
            dadosAtualizacao.calorias_totais || 0,
            dadosAtualizacao.proteinas_totais || 0,
            dadosAtualizacao.carboidratos_totais || 0,
            dadosAtualizacao.gorduras_totais || 0,
            dadosAtualizacao.tipo_refeicao || 'outros',
            dadosAtualizacao.observacoes || '',
            idRefeicao,
            idUsuario
        ]);
    }

    /**
     * Deleta uma refeição.
     * @param {number} idRefeicao - ID da refeição a ser deletada.
     * @param {number} idUsuario - ID do usuário.
     * @returns {Promise<boolean>} Retorna true se a refeição foi deletada, false caso contrário.
     */
    static async deletar(idRefeicao, idUsuario) {
        const [resultado] = await bancoDados.query(
            'DELETE FROM refeicoes WHERE id = ? AND id_usuario = ?',
            [idRefeicao, idUsuario]
        );
        return resultado.affectedRows > 0;
    }

    /**
     * Verifica se uma refeição pertence a um usuário.
     * @param {number} idRefeicao - ID da refeição.
     * @param {number} idUsuario - ID do usuário.
     * @returns {Promise<boolean>} True se pertence, false caso contrário.
     */
    static async pertenceAoUsuario(idRefeicao, idUsuario) {
        const [refeicaoExistente] = await bancoDados.query(
            'SELECT id FROM refeicoes WHERE id = ? AND id_usuario = ?',
            [idRefeicao, idUsuario]
        );
        return refeicaoExistente.length > 0;
    }
}

export default RefeicoesModel;