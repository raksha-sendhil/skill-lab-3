const router = require('express').Router();
const Listing = require('../models/Listing');
const User = require('../models/User');

// Public impact numbers for the home page
router.get('/', async (req, res) => {
  const [totals] = await Listing.aggregate([
    { $match: { status: 'picked_up' } },
    { $group: { _id: null, mealsSaved: { $sum: '$servings' }, pickups: { $sum: 1 } } },
  ]);
  const [donors, ngos] = await Promise.all([
    User.countDocuments({ role: 'donor' }),
    User.countDocuments({ role: 'ngo' }),
  ]);

  res.json({
    mealsSaved: totals?.mealsSaved || 0,
    pickups: totals?.pickups || 0,
    donors,
    ngos,
  });
});

module.exports = router;
