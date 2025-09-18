import MeusDadosModel from '../models/meusDados.js';

class MeusDadosController {

    static async buscarDados(req, res) {
        try {
            const dadosQuiz = await MeusDadosModel.buscarDados(req.idUsuario);
            res.json(dadosQuiz);
        } catch (erro) {
            console.error('❌ Erro ao buscar respostas do quiz:', erro);
            res.status(500).json({
                mensagem: 'Erro ao buscar respostas do quiz',
                erro: erro.message
            });
        }
    }

    static async salvarOuAtualizar(req, res) {
        try {
            const status = await MeusDadosModel.salvarOuAtualizar(req.idUsuario, req.body);
            if (status === 'salvo') {
                console.log(`✅ Quiz salvo para usuário ${req.idUsuario}`);
                res.status(201).json({ mensagem: 'Quiz salvo com sucesso' });
            } else {
                console.log(`✅ Quiz atualizado para usuário ${req.idUsuario}`);
                res.json({ mensagem: 'Quiz atualizado com sucesso' });
            }
        } catch (erro) {
            console.error('❌ Erro ao salvar quiz:', erro);
            res.status(500).json({
                mensagem: 'Erro ao salvar respostas do quiz',
                erro: erro.message
            });
        }
    }

    static async deletarDados(req, res) {
        try {
            await MeusDadosModel.deletarDados(req.idUsuario);
            console.log(`✅ Quiz deletado para usuário ${req.idUsuario}`);
            res.json({ mensagem: 'Quiz deletado com sucesso' });
        } catch (erro) {
            console.error('❌ Erro ao deletar quiz:', erro);
            res.status(500).json({
                mensagem: 'Erro ao deletar respostas do quiz',
                erro: erro.message
            });
        }
    }
}

export default MeusDadosController;