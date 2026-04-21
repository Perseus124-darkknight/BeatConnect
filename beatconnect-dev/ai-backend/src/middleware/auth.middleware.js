import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'beatconnect-super-secret-key';

export function authenticateToken(req, res, next) {
  // Check cookie first (for browser sessions), then Authorization header (for Bearer tokens)
  const token = req.cookies?.token || (req.headers['authorization'] && req.headers['authorization'].split(' ')[1]);

  if (!token) return res.status(401).json({ error: 'Token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

export function authorizeAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrative privileges required' });
  }
  next();
}
