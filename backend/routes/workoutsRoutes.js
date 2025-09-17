import express from 'express';
import { requerAutenticacao } from '../middleware/auth.js';
import WorkoutsController from '../controllers/workoutsController.js';

const roteador = express.Router();

/**
 * @route GET /
 * @description Busca o plano de treino mais recente do usuário.
 */
roteador.get('/', requerAutenticacao, WorkoutsController.buscarPlano);

/**
 * @route POST /
 * @description Salva um novo plano de treino.
 */
roteador.post('/', requerAutenticacao, WorkoutsController.salvarPlano);

/**
 * @route POST /gerar
 * @description Gera e salva um plano de treino a partir do quiz.
 */
roteador.post('/gerar', requerAutenticacao, WorkoutsController.gerarPlanoIA);

/**
 * @route PUT /
 * @description Atualiza o plano de treino mais recente.
 */
roteador.put('/', requerAutenticacao, WorkoutsController.atualizarPlano);

export default roteador;