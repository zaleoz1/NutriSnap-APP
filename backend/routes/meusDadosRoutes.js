import express from 'express';
import { requerAutenticacao } from '../middleware/auth.js';
import MeusDadosController from '../controllers/meusDadosController.js';

const roteador = express.Router();

/**
 * @route GET /
 * @description Busca as respostas do quiz do usuário.
 */
roteador.get('/', requerAutenticacao, MeusDadosController.buscarDados);

/**
 * @route POST /
 * @description Salva ou atualiza as respostas do quiz.
 */
roteador.post('/', requerAutenticacao, MeusDadosController.salvarOuAtualizar);

/**
 * @route DELETE /
 * @description Deleta as respostas do quiz.
 */
roteador.delete('/', requerAutenticacao, MeusDadosController.deletarDados);

export default roteador;