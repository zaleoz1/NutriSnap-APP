import WorkoutsModel from '../models/workouts.js';

class WorkoutsController {

    static async buscarPlano(req, res) {
        try {
            const plano = await WorkoutsModel.buscarUltimoPlano(req.idUsuario);
            res.json(plano);
        } catch (erro) {
            console.error('❌ Erro ao buscar treinos:', erro);
            res.status(500).json({ mensagem: 'Erro ao buscar treinos', erro: erro.message });
        }
    }

    static async salvarPlano(req, res) {
        try {
            const { plano } = req.body;
            await WorkoutsModel.salvarPlano(req.idUsuario, plano);
            res.json({ mensagem: 'Treino salvo com sucesso' });
        } catch (erro) {
            console.error('❌ Erro ao salvar treino:', erro);
            res.status(500).json({ mensagem: 'Erro ao salvar treino', erro: erro.message });
        }
    }

    static async gerarPlanoIA(req, res) {
        try {
            const dadosQuiz = await WorkoutsModel.buscarDadosQuiz(req.idUsuario);
            if (!dadosQuiz) {
                return res.status(400).json({ mensagem: 'Complete o quiz primeiro para gerar um plano personalizado' });
            }

            const planoGerado = WorkoutsModel.gerarPlanoTreino(dadosQuiz);
            await WorkoutsModel.salvarPlano(req.idUsuario, planoGerado);

            console.log(`✅ Plano de treino gerado para usuário ${req.idUsuario}`);
            res.json({
                mensagem: 'Plano de treino gerado com sucesso',
                plano: planoGerado
            });
        } catch (erro) {
            console.error('❌ Erro ao gerar plano de treino:', erro);
            res.status(500).json({ mensagem: 'Erro ao gerar plano de treino', erro: erro.message });
        }
    }

    static async atualizarPlano(req, res) {
        try {
            const { plano } = req.body;
            await WorkoutsModel.atualizarPlano(req.idUsuario, plano);
            res.json({ mensagem: 'Plano atualizado com sucesso' });
        } catch (erro) {
            console.error('❌ Erro ao atualizar treino:', erro);
            res.status(500).json({ mensagem: 'Erro ao atualizar treino', erro: erro.message });
        }
    }
}

export default WorkoutsController;