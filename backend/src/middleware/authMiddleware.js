import jwt from 'jsonwebtoken';

export const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'eventlay_super_secret_jwt_key_2026_mvp_aws_deployable';
    const decoded = jwt.verify(token, secret);

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      name: decoded.name,
      email: decoded.email,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

export const requireRole = (allowedRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (req.user.role !== allowedRole) {
      return res.status(403).json({ message: `Forbidden: Access requires ${allowedRole} role.` });
    }

    next();
  };
};
