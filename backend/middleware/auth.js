import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Token ausente' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreta');
    req.userId = decoded.id;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}
