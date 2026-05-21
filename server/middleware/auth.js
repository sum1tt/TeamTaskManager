const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied, no token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey_replace_me_in_production');
    req.user = decoded; // { id, email, ... }
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};
