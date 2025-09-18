import bancoDados from '../config/db.js';
import bcrypt from 'bcrypt';

class UsuariosModel {

    /**
     * Busca os dados completos do perfil de um usuário.
     * @param {number} idUsuario - ID do usuário.
     * @returns {Promise<object|null>} Dados do usuário e quiz, ou null.
     */
    static async buscarPerfilCompleto(idUsuario) {
        const [usuarios] = await bancoDados.query(
            'SELECT id, nome, email, criado_em FROM usuarios WHERE id = ?',
            [idUsuario]
        );

        if (usuarios.length === 0) {
            return null;
        }

        const usuario = usuarios[0];

        const [quizData] = await bancoDados.query(
            'SELECT idade, sexo, altura, peso_atual, peso_meta, objetivo, nivel_atividade FROM meus_dados WHERE id_usuario = ?',
            [idUsuario]
        );

        if (quizData.length > 0) {
            Object.assign(usuario, quizData[0]);
        }
        return usuario;
    }

    /**
     * Atualiza os dados de perfil de um usuário.
     * @param {number} idUsuario - ID do usuário.
     * @param {object} dados - Dados a serem atualizados.
     */
    static async atualizarPerfil(idUsuario, dados) {
        // Atualiza dados básicos
        await bancoDados.query(
            'UPDATE usuarios SET nome = ?, email = ? WHERE id = ?',
            [dados.nome, dados.email, idUsuario]
        );

        // Atualiza/Insere dados do quiz
        const [quizExistente] = await bancoDados.query(
            'SELECT id FROM meus_dados WHERE id_usuario = ?',
            [idUsuario]
        );

        if (quizExistente.length > 0) {
            await bancoDados.query(`
                UPDATE meus_dados SET
                idade = ?, sexo = ?, altura = ?, peso_atual = ?, peso_meta = ?,
                objetivo = ?, nivel_atividade = ?, atualizado_em = CURRENT_TIMESTAMP
                WHERE id_usuario = ?
            `, [
                dados.idade || null, dados.sexo || null, dados.altura || null,
                dados.peso_atual || null, dados.peso_meta || null,
                dados.objetivo || null, dados.nivel_atividade || null, idUsuario
            ]);
        } else if (Object.keys(dados).some(k => ['idade', 'sexo', 'altura', 'peso_atual', 'peso_meta', 'objetivo', 'nivel_atividade'].includes(k))) {
            await bancoDados.query(`
                INSERT INTO meus_dados (
                id_usuario, idade, sexo, altura, peso_atual, peso_meta,
                objetivo, nivel_atividade
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                idUsuario, dados.idade || null, dados.sexo || null, dados.altura || null,
                dados.peso_atual || null, dados.peso_meta || null, dados.objetivo || null, dados.nivel_atividade || null
            ]);
        }
    }

    /**
     * Altera a senha do usuário.
     * @param {number} idUsuario - ID do usuário.
     * @param {string} novaSenha - Nova senha em texto puro.
     */
    static async alterarSenha(idUsuario, novaSenha) {
        const saltRounds = 10;
        const novaSenhaHash = await bcrypt.hash(novaSenha, saltRounds);
        await bancoDados.query(
            'UPDATE usuarios SET senha = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?',
            [novaSenhaHash, idUsuario]
        );
    }

    /**
     * Busca o hash da senha de um usuário.
     * @param {number} idUsuario - ID do usuário.
     * @returns {Promise<string|null>} Hash da senha ou null.
     */
    static async buscarHashSenha(idUsuario) {
        const [usuarios] = await bancoDados.query(
            'SELECT senha FROM usuarios WHERE id = ?',
            [idUsuario]
        );
        return usuarios[0]?.senha || null;
    }
}

export default UsuariosModel;