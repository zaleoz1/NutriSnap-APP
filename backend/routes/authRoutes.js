import express from 'express';
import AuthController from '../controllers/AuthController.js';

const roteador = express.Router();

/**
 * @route POST /registrar
 * @description Registra um novo usuário.
 */
roteador.post('/registrar', AuthController.registrar);

/**
 * @route POST /entrar
 * @description Realiza o login do usuário e gera um token JWT.
 */
roteador.post('/entrar', AuthController.entrar);

/**
 * @route GET /verificar
 * @description Verifica se um token JWT é válido.
 */
roteador.get('/verificar', AuthController.verificar);

export default roteador;