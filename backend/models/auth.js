import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import bancoDados from '../config/db.js';

class AuthModel {

  /**
   * Encontra um usuário pelo email.
   * @param {string} email
   * @returns {Promise<object|null>} Usuário ou null.
   */
  static async encontrarPorEmail(email) {
    const [usuarios] = await bancoDados.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    return usuarios[0] || null;
  }

  /**
   * Encontra um usuário pelo ID.
   * @param {number} id
   * @returns {Promise<object|null>} Usuário ou null.
   */
  static async encontrarPorId(id) {
    const [usuarios] = await bancoDados.query('SELECT id, nome, email FROM usuarios WHERE id = ?', [id]);
    return usuarios[0] || null;
  }

  /**
   * Cria um novo usuário no banco de dados.
   * @param {string} nome
   * @param {string} email
   * @param {string} senha
   * @returns {Promise<object>} Objeto do usuário criado.
   */
  static async criarUsuario(nome, email, senha) {
    const saltRounds = 12;
    const senhaCriptografada = await bcrypt.hash(senha, saltRounds);

    const [resultado] = await bancoDados.query(
      'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
      [nome, email, senhaCriptografada]
    );

    return {
      id: resultado.insertId,
      nome,
      email
    };
  }

  /**
   * Compara uma senha em texto puro com uma senha criptografada.
   * @param {string} senha
   * @param {string} senhaCriptografada
   * @returns {Promise<boolean>}
   */
  static async compararSenha(senha, senhaCriptografada) {
    return await bcrypt.compare(senha, senhaCriptografada);
  }

  /**
   * Gera um token JWT para um usuário.
   * @param {object} usuario
   * @returns {string} Token JWT.
   */
  static gerarToken(usuario) {
    const payload = { id: usuario.id, email: usuario.email, nome: usuario.nome };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secreta',
      {
        expiresIn: '7d',
        issuer: 'nutrisnap',
        audience: 'nutrisnap-users'
      }
    );
    return token;
  }

  /**
   * Decodifica e verifica um token JWT.
   * @param {string} token
   * @returns {object} Payload do token.
   */
  static verificarToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET || 'secreta');
  }
}

export default AuthModel;