const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../auth');

const prisma = new PrismaClient();

const sign = (id) => jwt.sign({ userId: id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const userShape = (u) => ({
  id: u.id,
  email: u.email,
  firstName: u.firstName,
  lastName: u.lastName,
  goals: u.goals ? {
    calories: u.goals.calories,
    protein: u.goals.protein,
    carbs: u.goals.carbs,
    fat: u.goals.fat,
    restrictions: (() => { try { return JSON.parse(u.goals.restrictions || '[]'); } catch { return []; } })(),
  } : null,
});

router.post('/register', async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  if (!email || !password || !firstName || !lastName)
    return res.status(400).json({ error: 'All fields required' });
  if (password.length < 8)
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  try {
    const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (exists) return res.status(400).json({ error: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(), password: hashed, firstName, lastName,
        goals: { create: { calories: 2000, protein: 150, carbs: 200, fat: 65 } },
      },
      include: { goals: true },
    });
    res.status(201).json({ token: sign(user.id), user: userShape(user) });
  } catch (err) {
    console.error('register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { goals: true },
    });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ error: 'Invalid email or password' });
    res.json({ token: sign(user.id), user: userShape(user) });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { goals: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: userShape(user) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

router.put('/goals', authMiddleware, async (req, res) => {
  const { calories, protein, carbs, fat, restrictions } = req.body;
  try {
    const goals = await prisma.userGoals.upsert({
      where: { userId: req.userId },
      update: {
        calories: calories || 2000,
        protein: protein || 150,
        carbs: carbs || 200,
        fat: fat || 65,
        restrictions: JSON.stringify(restrictions || []),
      },
      create: {
        userId: req.userId,
        calories: calories || 2000,
        protein: protein || 150,
        carbs: carbs || 200,
        fat: fat || 65,
        restrictions: JSON.stringify(restrictions || []),
      },
    });
    res.json({ goals: { ...goals, restrictions: JSON.parse(goals.restrictions) } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save goals' });
  }
});

router.post('/history', authMiddleware, async (req, res) => {
  const { date, school, hallName, plan, totals } = req.body;
  try {
    const entry = await prisma.mealHistory.create({
      data: {
        userId: req.userId,
        date: date || new Date().toISOString().split('T')[0],
        school,
        hallName,
        planJson: JSON.stringify(plan),
        calories: Math.round(totals.calories || 0),
        protein: totals.protein || 0,
        carbs: totals.carbs || 0,
        fat: totals.fat || 0,
      },
    });
    res.status(201).json({ entry });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save history' });
  }
});

router.get('/history', authMiddleware, async (req, res) => {
  try {
    const entries = await prisma.mealHistory.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
    res.json({ history: entries.map(e => ({ ...e, plan: JSON.parse(e.planJson) })) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load history' });
  }
});

module.exports = router;
