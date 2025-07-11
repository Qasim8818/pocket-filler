const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate requests using JWT.
 * Checks for the presence of a valid token in the Authorization header.
 */
exports.authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token missing' });
  }

  if (!process.env.SECRETKEY) {
    console.error('JWT secret key is not set in environment variables.');
    return res.status(500).json({ message: 'Internal server error: missing JWT secret.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRETKEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
