const jwt = require('jsonwebtoken');

// Checks the Bearer token and sets req.user = { id, role }
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Please log in first' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Session expired, please log in again' });
  }
}

const roleNames = { donor: 'donors', ngo: 'NGOs' };

function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: `Only ${roleNames[role]} can do this` });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
