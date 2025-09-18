import express from 'express';
import { requerAutenticacao } from '../middleware/auth.js';
import RefeicoesController from '../controllers/refeicoesController.js';

const roteador = express.Router();

/**
 * @route GET /
 * @description Busca todas as refeições do usuário.
 */
roteador.get('/', requerAutenticacao, RefeicoesController.buscarTodas);

/**
 * @route POST /
 * @description Salva uma nova refeição.
 */
roteador.post('/', requerAutenticacao, RefeicoesController.salvar);

/**
 * @route PUT /:id
 * @description Atualiza uma refeição existente.
 */
roteador.put('/:id', requerAutenticacao, RefeicoesController.atualizar);

/**
 * @route DELETE /:id
 * @description Deleta uma refeição.
 */
roteador.delete('/:id', requerAutenticacao, RefeicoesController.deletar);

export default roteador;