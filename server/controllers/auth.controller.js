/**
 * Authentication Controller
 * 
 * Handles user registration, login, and user retrieval.
 * See auth.controller.md for detailed documentation.
 */

const jwt = require('jsonwebtoken');
const jwt_secret = process.env.JWT_SECRET; // Secret key for signing/verifying JWT tokens
const User = require('../models/User.model.js');
const bcrypt = require('bcryptjs'); // Password hashing library
const { verifyPassword } = require('../utils/password.js');



/**
 * Login Handler - POST /api/auth/login
 * 
 * Authenticates user and returns JWT token. Returns same error for invalid
 * email/password to prevent information leakage.
 */
const login = async (req, res) => {
  if (!req.body.email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  if (!req.body.password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await User.findOne({ email }).exec();
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Create JWT token with user info, expires in 1 hour
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, username: user.username },
      jwt_secret,
      { expiresIn: "1h" }
    );
    
    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

/**
 * Register Handler - POST /api/auth/register
 * 
 * Creates a new user account. Hashes password with bcrypt before storage.
 * Checks for duplicate email/username before creating.
 */
const register = async (req,res) => {
  if (!req.body || !req.body.email || !req.body.password || !req.body.username || !req.body.role) {
    return res.status(400).json({error: 'Bad Request'}) // Maybe split into specifics
  }
  
  const username = req.body.username
  const email = req.body.email
  const password = req.body.password
  const role = req.body.role
  
  // Check for duplicates using MongoDB $or operator
  const existingUser = await User.findOne({ 
    $or: [{ email }, { username }] 
  }).exec();
  
  if (existingUser) {
    if (existingUser.email === email) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    if (existingUser.username === username) {
      return res.status(400).json({ error: 'Username already exists' });
    }
  }
  
  // Hash password: generate salt (cost factor 10) then hash
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);  

  const new_user = {
    username: username,
    email: email,
    password: hash, // Store hash, never plain text
    role: role
  }
  
  // maybe implement mongoose presave middleware hook
  try {
    const createdUser = await User.create(new_user);
    res.status(201).json({ 
      message: 'User registered successfully',
      user: {
        id: createdUser._id,
        username: createdUser.username,
        email: createdUser.email,
        role: createdUser.role
      }
    });
  } catch (error) {
    // Handle MongoDB duplicate key errors (race condition protection)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        error: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` 
      });
    }
    res.status(500).json({ error: 'Failed to register user' });
    return;
  }
}

/**
 * Get Users Handler - GET /api/auth/users (Admin Only)
 * 
 * Admin-only endpoint that returns a list of all users.
 * Excludes password hashes from the response for security.
 * Supports optional query parameters for pagination and filtering.
 */
const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 50, role, organization } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Build query filter
        const filter = {};
        if (role) filter.role = role;
        if (organization) filter.organization = organization;
        
        // Fetch users (excluding password field)
        const users = await User.find(filter)
            .select('-password') // Exclude password hash
            .limit(parseInt(limit))
            .skip(skip)
            .sort({ createdAt: -1 })
            .exec();
        
        // Get total count for pagination
        const total = await User.countDocuments(filter);
        
        res.json({
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

module.exports = {
    getUsers,
    login,
    register
};