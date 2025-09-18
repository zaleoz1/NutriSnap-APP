import RefeicoesModel from '../models/refeicoes.js';

class RefeicoesController {

    static async buscarTodas(req, res) {
        try {
            const refeicoes = await RefeicoesModel.buscarTodas(req.idUsuario);
            console.log(`📋 Buscando refeições para usuário ${req.idUsuario}: ${refeicoes.length} encontradas`);
            res.json(refeicoes);
        } catch (erro) {
            console.error('❌ Erro ao buscar refeições:', erro);
            res.status(500).json({ mensagem: 'Erro ao buscar refeições', erro: erro.message });
        }
    }

    static async salvar(req, res) {
        try {
            const { itens, calorias_totais } = req.body;
            if (!itens || !Array.isArray(itens) || itens.length === 0 || !calorias_totais || calorias_totais <= 0) {
                return res.status(400).json({ mensagem: 'Dados da refeição inválidos ou incompletos.' });
            }

            const idRefeicao = await RefeicoesModel.salvar(req.idUsuario, req.body);
            res.status(201).json({
                mensagem: 'Refeição salva com sucesso',
                id: idRefeicao
            });
        } catch (erro) {
            console.error('❌ Erro ao salvar refeição:', erro);
            res.status(500).json({ mensagem: 'Erro ao salvar refeição', erro: erro.message });
        }
    }

    static async atualizar(req, res) {
        try {
            const { id } = req.params;
            const pertence = await RefeicoesModel.pertenceAoUsuario(id, req.idUsuario);
            if (!pertence) {
                return res.status(404).json({ mensagem: 'Refeição não encontrada' });
            }
            await RefeicoesModel.atualizar(id, req.idUsuario, req.body);
            res.json({ mensagem: 'Refeição atualizada com sucesso' });
        } catch (erro) {
            console.error('❌ Erro ao atualizar refeição:', erro);
            res.status(500).json({ mensagem: 'Erro ao atualizar refeição', erro: erro.message });
        }
    }

    static async deletar(req, res) {
        try {
            const { id } = req.params;
            const deletado = await RefeicoesModel.deletar(id, req.idUsuario);
            if (deletado) {
                res.json({ mensagem: 'Refeição removida com sucesso' });
            } else {
                res.status(404).json({ mensagem: 'Refeição não encontrada' });
            }
        } catch (erro) {
            console.error('❌ Erro ao deletar refeição:', erro);
            res.status(500).json({ mensagem: 'Erro ao deletar refeição', erro: erro.message });
        }
    }
}

export default RefeicoesController;