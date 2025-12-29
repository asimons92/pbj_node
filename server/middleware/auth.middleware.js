const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;


const auth = (req, res, next) => {
    // 1. Get token from header
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Token is not valid" });
    }
  }

/**
 * Require Admin Role Middleware
 * 
 * Must be used after the auth middleware. Checks if the authenticated user
 * has the 'admin' role. Returns 403 Forbidden if user is not an admin.
 */
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
    }
    
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
    }
    
    next();
}

  module.exports = {auth, requireAdmin}