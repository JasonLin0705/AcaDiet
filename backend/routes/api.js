const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const nutrislice = require('../services/nutrislice');
const mealPlanner = require('../services/mealPlanner');
const { optionalAuth } = require('../auth');

const prisma = new PrismaClient();

router.get('/universities/search', (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 1) return res.json({ universities: [] });
  res.json({ universities: nutrislice.searchUniversities(q.trim()) });
});

router.get('/dining-halls', async (req, res, next) => {
  const { school } = req.query;
  if (!school) return res.status(400).json({ error: 'school parameter required' });
  try {
    const halls = await nutrislice.getDiningHalls(school);
    res.json({ halls });
  } catch (err) {
    const status = err.code === 'ECONNREFUSED' || err.response?.status === 404 ? 404 : 502;
    res.status(status).json({
      error: 'Could not reach this school on Nutrislice',
      detail: err.message,
      notOnNutrislice: true,
    });
  }
});

router.post('/meal-plan/generate', optionalAuth, async (req, res, next) => {
  const { school, hall, date, goals, restrictions, menuTypes,
          breakfastHall, lunchHall, dinnerHall } = req.body;
  if (!school || !goals)
    return res.status(400).json({ error: 'school and goals are required' });

  try {
    const menuDate = date || new Date().toISOString().split('T')[0];
    let menu;
    const isMultiHall = breakfastHall || lunchHall || dinnerHall;

    if (isMultiHall) {
      const fallback = breakfastHall || lunchHall || dinnerHall || (hall ? { slug: hall } : null);
      const hallMap = {
        breakfast: breakfastHall || fallback,
        lunch:     lunchHall     || fallback,
        dinner:    dinnerHall    || fallback,
      };
      menu = await nutrislice.getMenuMultiHall(school, hallMap, menuDate);
    } else {
      if (!hall) return res.status(400).json({ error: 'hall is required when not using multi-hall mode' });
      menu = await nutrislice.getMenu(school, hall, menuDate, menuTypes || []);
    }

    const totalItems = Object.values(menu).reduce((s, a) => s + a.length, 0);
    if (totalItems === 0) {
      return res.status(404).json({
        error: 'No menu data available',
        detail: 'These dining halls have no menus published for the selected date. They may be closed or menus may not be posted yet.',
        noMenuData: true,
      });
    }

    const labelItem = (item, h) => h ? { ...item, hallName: h.name || h.slug } : item;
    const taggedMenu = isMultiHall ? {
      breakfast: menu.breakfast.map(i => labelItem(i, breakfastHall)),
      lunch:     menu.lunch.map(i => labelItem(i, lunchHall)),
      dinner:    menu.dinner.map(i => labelItem(i, dinnerHall)),
    } : menu;

    let favorites = [];
    if (req.userId) {
      try {
        favorites = await prisma.favoriteFood.findMany({ where: { userId: req.userId } });
      } catch {}
    }
    const plan = mealPlanner.generate(taggedMenu, goals, restrictions || [], { favorites });
    plan.halls = isMultiHall
      ? { breakfast: breakfastHall, lunch: lunchHall, dinner: dinnerHall }
      : { breakfast: { slug: hall }, lunch: { slug: hall }, dinner: { slug: hall } };

    res.json(plan);
  } catch (err) {
    next(err);
  }
});

router.post('/meal-plan/swap', optionalAuth, async (req, res, next) => {
  const { school, hallSlug, mealType, date, menuTypes,
          goals, restrictions, keptItems, excludeIds } = req.body;
  if (!school || !hallSlug || !mealType || !goals)
    return res.status(400).json({ error: 'school, hallSlug, mealType and goals are required' });
  if (!['breakfast', 'lunch', 'dinner'].includes(mealType))
    return res.status(400).json({ error: 'invalid mealType' });

  try {
    const menuDate = date || new Date().toISOString().split('T')[0];
    const menu = await nutrislice.getMenu(school, hallSlug, menuDate, menuTypes || []);
    let candidates = mealPlanner.filterByRestrictions(menu[mealType] || [], restrictions || []);

    const exclude = new Set((excludeIds || []).map(String));
    candidates = candidates.filter(item => !exclude.has(String(item.id)));

    if (!candidates.length) return res.json({ item: null });

    let favorites = [];
    if (req.userId) {
      try {
        favorites = await prisma.favoriteFood.findMany({ where: { userId: req.userId } });
      } catch {}
    }

    const item = mealPlanner.selectSwap(candidates, mealType, goals, keptItems || [], favorites);
    res.json({ item: item || null });
  } catch (err) {
    next(err);
  }
});

router.get('/share/:token', async (req, res) => {
  try {
    const entry = await prisma.mealHistory.findUnique({
      where: { shareToken: req.params.token },
      select: { id: true, date: true, school: true, hallName: true, planJson: true, calories: true, protein: true, carbs: true, fat: true },
    });
    if (!entry) return res.status(404).json({ error: 'Shared plan not found' });
    res.json({ ...entry, plan: JSON.parse(entry.planJson), planJson: undefined });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load shared plan' });
  }
});

module.exports = router;
