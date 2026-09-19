const jwt = require('jsonwebtoken');

// =====================================================
// ROLE CONSTANTS
// =====================================================

const ROLES = {
  LAWYER: 'LAWYER',
  POLICE: 'POLICE',
  FAMILY_MEMBER: 'FAMILY_MEMBER',
  FAMILY: 'FAMILY_MEMBER',
};

// =====================================================
// authenticateToken
// Reads Authorization: Bearer <token>, verifies JWT,
// attaches decoded user to req.user.
// =====================================================

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'justiceflow_demo_secret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

// =====================================================
// requireRole
// Checks req.user.role against a list of allowed roles.
// Must be used AFTER authenticateToken.
// =====================================================

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    const userRole = (req.user.role === 'FAMILY') ? 'FAMILY_MEMBER' : req.user.role;
    const normalizedRoles = roles.map(r => (r === 'FAMILY') ? 'FAMILY_MEMBER' : r);

    if (!normalizedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
}

module.exports = {
  ROLES,
  authenticateToken,
  requireRole,
};
