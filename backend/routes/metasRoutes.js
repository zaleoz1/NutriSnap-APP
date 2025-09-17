import express from 'express';
import { requerAutenticacao } from '../middleware/auth.js';
import MetasController from '../controllers/metasController.js';

const roteador = express.Router();

/**
 * @route GET /
 * @description Busca a meta mais recente do usuário.
 */
roteador.get('/', requerAutenticacao, MetasController.buscarMeta);

/**
 * @route POST /
 * @description Salva uma nova meta para o usuário.
 */
roteador.post('/', requerAutenticacao, MetasController.salvarMeta);

/**
 * @route POST /gerar-ia
 * @description Gera metas nutricionais inteligentes a partir dos dados do quiz.
 */
roteador.post('/gerar-ia', requerAutenticacao, MetasController.gerarMetasIA);

/**
 * @route PUT /atualizar
 * @description Atualiza a meta mais recente do usuário.
 */
roteador.put('/atualizar', requerAutenticacao, MetasController.atualizarMeta);

export default roteador;