const router = require('express').Router();
const nutrislice = require('../services/nutrislice');
const mealPlanner = require('../services/mealPlanner');

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

router.post('/meal-plan/generate', async (req, res, next) => {
  const { school, hall, date, goals, restrictions } = req.body;
  if (!school || !hall || !goals) {
    return res.status(400).json({ error: 'school, hall, and goals are required' });
  }
  try {
    const menuDate = date || new Date().toISOString().split('T')[0];
    const menu = await nutrislice.getMenu(school, hall, menuDate);
    const plan = mealPlanner.generate(menu, goals, restrictions || []);
    res.json(plan);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
