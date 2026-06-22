const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
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

router.get('/history/stats', authMiddleware, async (req, res) => {
  try {
    const entries = await prisma.mealHistory.findMany({
      where: { userId: req.userId },
      orderBy: { date: 'asc' },
      take: 30,
      select: { date: true, calories: true, protein: true, carbs: true, fat: true },
    });
    const byDate = {};
    for (const e of entries) {
      if (!byDate[e.date]) byDate[e.date] = { date: e.date, calories: 0, protein: 0, carbs: 0, fat: 0 };
      byDate[e.date].calories += e.calories;
      byDate[e.date].protein  += e.protein;
      byDate[e.date].carbs    += e.carbs;
      byDate[e.date].fat      += e.fat;
    }
    res.json({ stats: Object.values(byDate) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

router.get('/favorites', authMiddleware, async (req, res) => {
  try {
    const favs = await prisma.favoriteFood.findMany({ where: { userId: req.userId } });
    res.json({ favorites: favs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load favorites' });
  }
});

router.post('/favorites', authMiddleware, async (req, res) => {
  const { id, name, calories, protein, carbs, fat,
          isVegetarian, isVegan, isGlutenFree, isHalal, isKosher } = req.body;
  if (!id || !name) return res.status(400).json({ error: 'id and name required' });
  try {
    const fav = await prisma.favoriteFood.upsert({
      where: { userId_foodId: { userId: req.userId, foodId: String(id) } },
      update: { foodName: name, calories: Math.round(calories || 0), protein: protein || 0, carbs: carbs || 0, fat: fat || 0 },
      create: {
        userId: req.userId,
        foodId: String(id),
        foodName: name,
        calories: Math.round(calories || 0),
        protein: protein || 0,
        carbs: carbs || 0,
        fat: fat || 0,
        isVegetarian: isVegetarian || false,
        isVegan: isVegan || false,
        isGlutenFree: isGlutenFree || false,
        isHalal: isHalal || false,
        isKosher: isKosher || false,
      },
    });
    res.status(201).json({ favorite: fav });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save favorite' });
  }
});

router.delete('/favorites/:foodId', authMiddleware, async (req, res) => {
  try {
    await prisma.favoriteFood.deleteMany({
      where: { userId: req.userId, foodId: req.params.foodId },
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

// --- Daily food log ---

router.post('/log', authMiddleware, async (req, res) => {
  const { date, name, calories, protein, carbs, fat } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'name is required' });
  try {
    const entry = await prisma.foodLog.create({
      data: {
        userId: req.userId,
        date: date || new Date().toISOString().split('T')[0],
        name: name.trim(),
        calories: Math.round(Number(calories) || 0),
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
      },
    });
    res.status(201).json({ entry });
  } catch (err) {
    res.status(500).json({ error: 'Failed to log food' });
  }
});

router.get('/log', authMiddleware, async (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  try {
    const entries = await prisma.foodLog.findMany({
      where: { userId: req.userId, date },
      orderBy: { createdAt: 'desc' },
    });
    const totals = entries.reduce(
      (a, e) => ({
        calories: a.calories + e.calories,
        protein: a.protein + e.protein,
        carbs: a.carbs + e.carbs,
        fat: a.fat + e.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
    res.json({ date, entries, totals });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load food log' });
  }
});

router.get('/log/monthly', authMiddleware, async (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7); // YYYY-MM
  try {
    const entries = await prisma.foodLog.findMany({
      where: { userId: req.userId, date: { startsWith: month } },
    });
    const byDate = {};
    for (const e of entries) {
      if (!byDate[e.date]) byDate[e.date] = { date: e.date, calories: 0, protein: 0, carbs: 0, fat: 0 };
      byDate[e.date].calories += e.calories;
      byDate[e.date].protein  += e.protein;
      byDate[e.date].carbs    += e.carbs;
      byDate[e.date].fat      += e.fat;
    }
    const days = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
    res.json({ month, days });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load monthly log' });
  }
});

router.delete('/log/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.foodLog.deleteMany({ where: { id: req.params.id, userId: req.userId } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove log entry' });
  }
});

router.post('/history/:id/share', authMiddleware, async (req, res) => {
  try {
    const entry = await prisma.mealHistory.findUnique({ where: { id: req.params.id } });
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    if (entry.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });
    const shareToken = entry.shareToken || crypto.randomBytes(8).toString('hex');
    await prisma.mealHistory.update({ where: { id: entry.id }, data: { shareToken } });
    res.json({ shareToken });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create share link' });
  }
});

module.exports = router;
