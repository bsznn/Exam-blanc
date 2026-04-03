const jwt = require('jsonwebtoken');

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Vérifie présence + format Bearer
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Non autorisé' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'your-app',
      audience: 'your-app-users',
    });

    req.user = decoded;
    next();

  } catch (error) {
    return res.status(403).json({ message: 'Accès refusé' });
  }
};


exports.isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès interdit' });
  }

  next();
};