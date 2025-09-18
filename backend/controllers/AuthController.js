import { z } from 'zod';
import AuthModel from '../models/auth.js';
import { esquemaRegistro, esquemaLogin } from '../utils/validation.js';

class AuthController {

  /**
   * Lida com o registro de um novo usuário.
   */
  static async registrar(req, res) {
    try {
      const dadosValidados = esquemaRegistro.parse(req.body);
      const usuarioExistente = await AuthModel.encontrarPorEmail(dadosValidados.email);

      if (usuarioExistente) {
        return res.status(409).json({
          mensagem: 'Email já está cadastrado. Use outro email ou faça login.'
        });
      }

      const novoUsuario = await AuthModel.criarUsuario(
        dadosValidados.nome,
        dadosValidados.email,
        dadosValidados.senha
      );

      console.log(`✅ Usuário registrado: ${novoUsuario.email} (ID: ${novoUsuario.id})`);
      res.status(201).json({
        mensagem: 'Conta criada com sucesso! Faça login para continuar.',
        usuario: novoUsuario
      });

    } catch (erro) {
      console.error('❌ Erro no registro:', erro);
      if (erro instanceof z.ZodError) {
        return res.status(400).json({
          mensagem: 'Dados inválidos',
          detalhes: erro.errors.map(e => e.message)
        });
      }
      res.status(500).json({ mensagem: 'Erro interno do servidor. Tente novamente.' });
    }
  }

  /**
   * Lida com o login do usuário.
   */
  static async entrar(req, res) {
    try {
      const dadosValidados = esquemaLogin.parse(req.body);
      const usuario = await AuthModel.encontrarPorEmail(dadosValidados.email);

      if (!usuario || !(await AuthModel.compararSenha(dadosValidados.senha, usuario.senha))) {
        return res.status(401).json({ mensagem: 'Email ou senha incorretos' });
      }

      const token = AuthModel.gerarToken(usuario);

      console.log(`✅ Login realizado: ${usuario.email} (ID: ${usuario.id})`);
      res.json({
        token,
        usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
        mensagem: 'Login realizado com sucesso!'
      });

    } catch (erro) {
      console.error('❌ Erro no login:', erro);
      if (erro instanceof z.ZodError) {
        return res.status(400).json({
          mensagem: 'Dados inválidos',
          detalhes: erro.errors.map(e => e.message)
        });
      }
      res.status(500).json({ mensagem: 'Erro interno do servidor. Tente novamente.' });
    }
  }

  /**
   * Lida com a verificação de um token JWT.
   */
  static async verificar(req, res) {
    try {
      const cabecalho = req.headers.authorization || '';
      const token = cabecalho.startsWith('Bearer ') ? cabecalho.slice(7) : null;

      if (!token) {
        return res.status(401).json({ mensagem: 'Token ausente', valido: false });
      }

      const decodificado = AuthModel.verificarToken(token);
      const usuario = await AuthModel.encontrarPorId(decodificado.id);

      if (!usuario) {
        return res.status(401).json({ mensagem: 'Usuário não encontrado', valido: false });
      }

      res.json({
        valido: true,
        usuario,
        mensagem: 'Token válido'
      });

    } catch (erro) {
      console.error('❌ Erro na verificação:', erro);
      res.status(401).json({ mensagem: 'Token inválido', valido: false });
    }
  }
}

export default AuthController;