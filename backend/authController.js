const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
        // Create user
        const user = await prisma.user.create({
            data: {
              email,
              password: hashedPassword,
              firstName,
              lastName,
              preferences: {
                create: {
                  dailyCalories: 2000,
                  dailyProtein: 150
                }
              }
            },
            include: {
              preferences: true
            }
          });
      
          const token = generateToken(user.id);
      
          res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              preferences: user.preferences
            }
          });
        } catch (error) {
          console.error('Registration error:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
    };

    exports.login = async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
    
        const { email, password } = req.body;
    
        // Find user
        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            preferences: true
          }
        });
    
        if (!user) {
          return res.status(400).json({ error: 'Invalid credentials' });
        }
    
        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return res.status(400).json({ error: 'Invalid credentials' });
        }
    
        const token = generateToken(user.id);
    
        res.json({
            message: 'Login successful',
            token,
            user: {
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              preferences: user.preferences
            }
          });
        } catch (error) {
          console.error('Login error:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      };
      
      exports.getProfile = async (req, res) => {
        try {
          const user = await prisma.user.findUnique({
            where: { id: req.userId },
            include: {
              preferences: true
            }
          });
      
          if (!user) {
            return res.status(404).json({ error: 'User not found' });
          }
      
          res.json({
            user: {
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              preferences: user.preferences
            }
          });
        } catch (error) {
          console.error('Profile error:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      };