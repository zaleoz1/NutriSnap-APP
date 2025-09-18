import AnaliseModel from '../models/analise.js';

/**
 * Controlador para a análise de refeições.
 * Lida com o fluxo da requisição e resposta.
 */
class AnaliseController {

    /**
     * Analisa uma imagem de refeição e retorna dados nutricionais.
     * @param {object} req - Objeto da requisição.
     * @param {object} res - Objeto da resposta.
     */
    static async analisarRefeicao(req, res) {
        const { dadosImagemBase64, pesoTotal, quantidadeItens, descricaoRefeicao } = req.body;

        if (!dadosImagemBase64) {
            return res.status(400).json({ mensagem: 'Imagem ausente' });
        }

        try {
            const infoAdicionais = { pesoTotal, quantidadeItens, descricaoRefeicao };

            // Chama o método do modelo para processar a análise
            const dadosAnalise = await AnaliseModel.analisarImagemComGemini(dadosImagemBase64, infoAdicionais);

            // Responde com os dados processados
            res.json(dadosAnalise);

        } catch (erro) {
            console.error('❌ Erro na análise de imagem:', erro);
            res.status(500).json({ mensagem: erro.message });
        }
    }
}

export default AnaliseController;