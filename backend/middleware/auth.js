import jwt from 'jsonwebtoken';

export function requerAutenticacao(req, res, next) {
  const cabecalho = req.headers.authorization || '';
  const token = cabecalho.startsWith('Bearer ') ? cabecalho.slice(7) : null;
  if (!token) return res.status(401).json({ mensagem: 'Token ausente' });

  try {
    const decodificado = jwt.verify(token, process.env.JWT_SECRET || 'secreta');
    req.idUsuario = decodificado.id;
    next();
  } catch (erro) {
    return res.status(401).json({ mensagem: 'Token inválido' });
  }
}