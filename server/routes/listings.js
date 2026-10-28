const router = require('express').Router();
const Listing = require('../models/Listing');
const { requireAuth, requireRole } = require('../middleware/auth');

const CONTACT = 'name phone';
const withContacts = (query) => query.populate('donor', CONTACT).populate('claimedBy', CONTACT);

// Marks available listings whose pickup deadline has passed as expired
const expireOld = () =>
  Listing.updateMany(
    { status: 'available', expiresAt: { $lt: new Date() } },
    { status: 'expired' }
  );

// Only these fields can be set by a donor; status, donor and claimedBy are controlled by the server
function listingFields(body) {
  const { title, foodType, servings, pickupAddress, city, expiresAt, notes } = body;
  return { title, foodType, servings, pickupAddress, city, expiresAt, notes };
}

const isFuture = (date) => new Date(date) > new Date();

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Loads a listing owned by the logged-in donor. Sends the error response and returns null if not allowed.
async function findOwnListing(req, res) {
  await expireOld();
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    res.status(404).json({ message: 'Listing not found' });
    return null;
  }
  if (!listing.donor.equals(req.user.id)) {
    res.status(403).json({ message: 'You can only manage your own listings' });
    return null;
  }
  return listing;
}

router.use(requireAuth);

// Available food for NGOs, soonest deadline first
router.get('/', async (req, res) => {
  await expireOld();
  const filter = { status: 'available' };
  if (req.query.city) {
    filter.city = new RegExp(escapeRegex(String(req.query.city).trim()), 'i');
  }
  res.json(await withContacts(Listing.find(filter).sort({ expiresAt: 1 })));
});

// Donor: listings they posted. NGO: listings they claimed or collected.
router.get('/mine', async (req, res) => {
  await expireOld();
  const filter = req.user.role === 'donor' ? { donor: req.user.id } : { claimedBy: req.user.id };
  res.json(await withContacts(Listing.find(filter).sort({ createdAt: -1 })));
});

router.get('/:id', async (req, res) => {
  await expireOld();
  const listing = await withContacts(Listing.findById(req.params.id));
  if (!listing) return res.status(404).json({ message: 'Listing not found' });
  res.json(listing);
});

router.post('/', requireRole('donor'), async (req, res) => {
  const fields = listingFields(req.body);
  if (!isFuture(fields.expiresAt)) {
    return res.status(400).json({ message: 'Pickup deadline must be in the future' });
  }
  const listing = await Listing.create({ ...fields, donor: req.user.id });
  res.status(201).json(await withContacts(Listing.findById(listing._id)));
});

router.put('/:id', requireRole('donor'), async (req, res) => {
  const listing = await findOwnListing(req, res);
  if (!listing) return;
  if (listing.status !== 'available') {
    return res.status(409).json({ message: 'Only available listings can be edited' });
  }

  const fields = listingFields(req.body);
  if (!isFuture(fields.expiresAt)) {
    return res.status(400).json({ message: 'Pickup deadline must be in the future' });
  }
  listing.set(fields);
  await listing.save();
  res.json(await withContacts(Listing.findById(listing._id)));
});

router.delete('/:id', requireRole('donor'), async (req, res) => {
  const listing = await findOwnListing(req, res);
  if (!listing) return;
  if (listing.status === 'claimed') {
    return res.status(409).json({ message: 'This listing has been claimed by an NGO and cannot be deleted' });
  }
  await listing.deleteOne();
  res.json({ message: 'Listing deleted' });
});

// The status check is part of the update query, so two NGOs can never claim the same listing
router.post('/:id/claim', requireRole('ngo'), async (req, res) => {
  await expireOld();
  const listing = await withContacts(
    Listing.findOneAndUpdate(
      { _id: req.params.id, status: 'available', expiresAt: { $gt: new Date() } },
      { status: 'claimed', claimedBy: req.user.id },
      { returnDocument: 'after' }
    )
  );
  if (!listing) return res.status(409).json({ message: 'Listing is no longer available' });
  res.json(listing);
});

router.post('/:id/unclaim', requireRole('ngo'), async (req, res) => {
  const listing = await withContacts(
    Listing.findOneAndUpdate(
      { _id: req.params.id, status: 'claimed', claimedBy: req.user.id },
      { status: 'available', claimedBy: null },
      { returnDocument: 'after' }
    )
  );
  if (!listing) {
    return res.status(409).json({ message: 'You can only unclaim a listing you have currently claimed' });
  }
  res.json(listing);
});

router.post('/:id/pickup', requireRole('donor'), async (req, res) => {
  const listing = await findOwnListing(req, res);
  if (!listing) return;
  if (listing.status !== 'claimed') {
    return res.status(409).json({ message: 'Only claimed listings can be marked as picked up' });
  }
  listing.status = 'picked_up';
  await listing.save();
  res.json(await withContacts(Listing.findById(listing._id)));
});

module.exports = router;
