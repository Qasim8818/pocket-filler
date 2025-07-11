const jwt = require('jsonwebtoken');

/**
 * JWT authentication middleware.
 * Verifies token presence and validity in Authorization header.
 */
exports.authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'No authorization header found.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token not provided.' });
  }

  if (!process.env.SECRETKEY) {
    console.error('JWT secret key missing in environment variables.');
    return res.status(500).json({ message: 'Server error: JWT secret not configured.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRETKEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is invalid or expired.' });
  }
};
