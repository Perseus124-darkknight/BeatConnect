import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'beatconnect-super-secret-key';

/**
 * Strict Server-Side Middleware for Admin Portal Protection.
 * Checks for a valid JWT in the cookies and verifies the 'admin' role.
 * If unauthorized, redirects to the home page with an auth flag.
 */
export function protectAdminPortal(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    console.log('[SECURITY] Unauthorized access attempt to /admin. Redirecting to home.');
    return res.redirect('/home?auth=admin_required');
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err || user.role !== 'admin') {
      console.log(`[SECURITY] Access Denied for user ${user?.username || 'unknown'}. Role: ${user?.role || 'none'}`);
      return res.redirect('/home?auth=admin_denied');
    }
    
    req.user = user;
    next();
  });
}
