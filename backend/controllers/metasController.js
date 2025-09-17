import MetasModel from '../models/metas.js';

class MetasController {

    static async buscarMeta(req, res) {
        try {
            const meta = await MetasModel.buscarUltimaMeta(req.idUsuario);
            res.json(meta);
        } catch (erro) {
            console.error('❌ Erro ao buscar metas:', erro);
            res.status(500).json({ mensagem: 'Erro ao buscar metas', erro: erro.message });
        }
    }

    static async salvarMeta(req, res) {
        try {
            await MetasModel.salvarMeta(req.idUsuario, req.body);
            res.json({ mensagem: 'Meta salva' });
        } catch (erro) {
            console.error('❌ Erro ao salvar metas:', erro);
            res.status(500).json({ mensagem: 'Erro ao salvar metas', erro: erro.message });
        }
    }

    static async gerarMetasIA(req, res) {
        try {
            const dadosQuiz = await MetasModel.buscarDadosQuiz(req.idUsuario);

            if (!dadosQuiz) {
                return res.status(400).json({ mensagem: 'Complete o quiz primeiro para gerar metas personalizadas' });
            }

            const metasNutricionais = MetasModel.gerarMetasNutricionais(dadosQuiz);

            await MetasModel.salvarMetaComQuiz(req.idUsuario, dadosQuiz, metasNutricionais);

            console.log(`✅ Metas nutricionais geradas para usuário ${req.idUsuario}`);
            res.json({
                mensagem: 'Metas nutricionais geradas com sucesso',
                metas: metasNutricionais
            });

        } catch (erro) {
            console.error('❌ Erro ao gerar metas nutricionais:', erro);
            res.status(500).json({ mensagem: 'Erro ao gerar metas nutricionais', erro: erro.message });
        }
    }

    static async atualizarMeta(req, res) {
        try {
            await MetasModel.atualizarMeta(req.idUsuario, req.body);
            res.json({ mensagem: 'Meta atualizada com sucesso!' });
        } catch (erro) {
            console.error('❌ Erro ao atualizar metas:', erro);
            res.status(500).json({ mensagem: 'Erro ao atualizar metas', erro: erro.message });
        }
    }
}

export default MetasController;