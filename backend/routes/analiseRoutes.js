import express from 'express';
import { requerAutenticacao } from '../middleware/auth.js';
import AnaliseController from '../controllers/AnaliseController.js';

const roteador = express.Router();

/**
 * @route POST /analisar
 * @description Analisa uma refeição a partir de uma imagem em Base64.
 * @access Privado (requer autenticação)
 */
roteador.post('/analisar', requerAutenticacao, AnaliseController.analisarRefeicao);

export default roteador;