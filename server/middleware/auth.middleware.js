const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;


const auth = (req, res, next) => {
    // 1. Get token from header
    authHeader = req.header('Authorization');
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

  module.exports = {auth}