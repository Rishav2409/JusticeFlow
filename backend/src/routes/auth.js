const express = require('express');
const jwt = require('jsonwebtoken');
const { get } = require('../database/db');
const { verifyPassword } = require('../utils/crypto');
const { ROLES, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Fallback demo credentials if DB lookup misses
const DEMO_FALLBACK = {
  'lawyer@justiceflow.demo': {
    id: 'LAWYER-001',
    name: 'Adv. Rajesh Kumar',
    email: 'lawyer@justiceflow.demo',
    role: ROLES.LAWYER,
    district: 'Central Delhi'
  },
  'police@justiceflow.demo': {
    id: 'POLICE-001',
    name: 'Inspector Vikram Sharma',
    email: 'police@justiceflow.demo',
    role: ROLES.POLICE,
    district: 'Central Delhi'
  },
  'family@justiceflow.demo': {
    id: 'FAMILY-001',
    name: 'Smt. Geeta Devi',
    email: 'family@justiceflow.demo',
    role: ROLES.FAMILY_MEMBER,
    district: 'Central Delhi'
  }
};

const VALID_PASSWORDS = {
  'lawyer@justiceflow.demo': ['lawyer123', 'JusticeFlow@123'],
  'police@justiceflow.demo': ['police123', 'JusticeFlow@123'],
  'family@justiceflow.demo': ['family123', 'JusticeFlow@123']
};

// =====================================================
// POST /api/auth/login
// =====================================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please enter your email and password.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Try DB lookup
    let userRow = await get('SELECT * FROM users WHERE lower(email) = ?', [cleanEmail]);
    let authenticated = false;

    if (userRow) {
      // Check stored hash or valid demo passwords
      if (verifyPassword(password, userRow.password_hash)) {
        authenticated = true;
      } else if (VALID_PASSWORDS[cleanEmail] && VALID_PASSWORDS[cleanEmail].includes(password)) {
        authenticated = true;
      }
    } else if (DEMO_FALLBACK[cleanEmail]) {
      // Fallback
      if (VALID_PASSWORDS[cleanEmail] && VALID_PASSWORDS[cleanEmail].includes(password)) {
        userRow = DEMO_FALLBACK[cleanEmail];
        authenticated = true;
      }
    }

    if (!authenticated || !userRow) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
    }

    // Role normalization
    const userRole = (userRow.role === 'FAMILY') ? ROLES.FAMILY_MEMBER : userRow.role;

    // Sign JWT
    const tokenPayload = {
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
      role: userRole,
      district: userRow.district || 'Central Delhi',
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'justiceflow_demo_secret', {
      expiresIn: '24h',
    });

    res.json({
      success: true,
      user: tokenPayload,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'An internal authentication error occurred.',
    });
  }
});

// =====================================================
// GET /api/auth/me
// Returns current authenticated user
// =====================================================
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

module.exports = router;
