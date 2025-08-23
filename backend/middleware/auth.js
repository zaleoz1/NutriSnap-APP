import jwt from 'jsonwebtoken';

export function requerAutenticacao(req, res, next) {
  try {
    const cabecalho = req.headers.authorization || '';
    
    if (!cabecalho) {
      return res.status(401).json({ 
        mensagem: 'Token de autenticação ausente',
        codigo: 'TOKEN_MISSING'
      });
    }
    
    if (!cabecalho.startsWith('Bearer ')) {
      return res.status(401).json({ 
        mensagem: 'Formato de token inválido. Use: Bearer <token>',
        codigo: 'TOKEN_FORMAT_INVALID'
      });
    }
    
    const token = cabecalho.slice(7);
    
    if (!token || token.trim() === '') {
      return res.status(401).json({ 
        mensagem: 'Token vazio',
        codigo: 'TOKEN_EMPTY'
      });
    }
    
    try {
      const decodificado = jwt.verify(token, process.env.JWT_SECRET || 'secreta');
      
      // Validar estrutura do payload
      if (!decodificado.id || !decodificado.email) {
        return res.status(401).json({ 
          mensagem: 'Token malformado',
          codigo: 'TOKEN_MALFORMED'
        });
      }
      
      // Adicionar dados do usuário ao request
      req.idUsuario = decodificado.id;
      req.emailUsuario = decodificado.email;
      req.nomeUsuario = decodificado.nome;
      
      next();
      
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          mensagem: 'Token expirado. Faça login novamente.',
          codigo: 'TOKEN_EXPIRED'
        });
      }
      
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          mensagem: 'Token inválido',
          codigo: 'TOKEN_INVALID'
        });
      }
      
      return res.status(401).json({ 
        mensagem: 'Erro na validação do token',
        codigo: 'TOKEN_VALIDATION_ERROR'
      });
    }
    
  } catch (erro) {
    console.error('❌ Erro no middleware de autenticação:', erro);
    return res.status(500).json({ 
      mensagem: 'Erro interno na autenticação',
      codigo: 'AUTH_INTERNAL_ERROR'
    });
  }
}

// Middleware opcional para verificar se o usuário está autenticado
export function autenticacaoOpcional(req, res, next) {
  try {
    const cabecalho = req.headers.authorization || '';
    
    if (cabecalho && cabecalho.startsWith('Bearer ')) {
      const token = cabecalho.slice(7);
      
      try {
        const decodificado = jwt.verify(token, process.env.JWT_SECRET || 'secreta');
        
        if (decodificado.id && decodificado.email) {
          req.idUsuario = decodificado.id;
          req.emailUsuario = decodificado.email;
          req.nomeUsuario = decodificado.nome;
          req.autenticado = true;
        }
      } catch (jwtError) {
        // Token inválido, mas não é erro crítico
        req.autenticado = false;
      }
    } else {
      req.autenticado = false;
    }
    
    next();
    
  } catch (erro) {
    console.error('❌ Erro no middleware de autenticação opcional:', erro);
    req.autenticado = false;
    next();
  }
}