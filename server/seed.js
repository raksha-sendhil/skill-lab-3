// Wipes the database and fills it with demo users and listings. Run with: npm run seed
require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Listing = require('./models/Listing');

const hoursFromNow = (hours) => new Date(Date.now() + hours * 60 * 60 * 1000);

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User.deleteMany(), Listing.deleteMany()]);

  const password = await bcrypt.hash('password123', 10);
  const [annapoorna, greenLeaf, feedBengaluru, mysuruCare] = await User.create([
    { name: 'Hotel Annapoorna', email: 'donor1@demo.com', role: 'donor', phone: '9876500001', city: 'Bengaluru', password },
    { name: 'Green Leaf Caterers', email: 'donor2@demo.com', role: 'donor', phone: '9876500002', city: 'Mysuru', password },
    { name: 'Feed Bengaluru Foundation', email: 'ngo1@demo.com', role: 'ngo', phone: '9876500003', city: 'Bengaluru', password },
    { name: 'Mysuru Care Trust', email: 'ngo2@demo.com', role: 'ngo', phone: '9876500004', city: 'Mysuru', password },
  ]);

  await Listing.create([
    // available, expiring soon
    { title: 'Veg biryani and raita', foodType: 'veg', servings: 40, pickupAddress: '12 MG Road', city: 'Bengaluru', expiresAt: hoursFromNow(2), notes: 'Please bring containers', donor: annapoorna._id },
    { title: 'Idli, vada and sambar', foodType: 'veg', servings: 25, pickupAddress: '12 MG Road', city: 'Bengaluru', expiresAt: hoursFromNow(1), donor: annapoorna._id },
    // available, tomorrow
    { title: 'Chicken curry and rice', foodType: 'non-veg', servings: 30, pickupAddress: '45 Sayyaji Rao Road', city: 'Mysuru', expiresAt: hoursFromNow(20), donor: greenLeaf._id },
    { title: 'Wedding buffet leftovers', foodType: 'mixed', servings: 60, pickupAddress: 'Lakshmi Convention Hall, Kuvempunagar', city: 'Mysuru', expiresAt: hoursFromNow(24), notes: 'Ask for the catering manager at the back gate', donor: greenLeaf._id },
    // claimed
    { title: 'Chapati and dal', foodType: 'veg', servings: 35, pickupAddress: '12 MG Road', city: 'Bengaluru', expiresAt: hoursFromNow(3), status: 'claimed', claimedBy: feedBengaluru._id, donor: annapoorna._id },
    // picked up
    { title: 'Lemon rice and curd rice', foodType: 'veg', servings: 50, pickupAddress: '12 MG Road', city: 'Bengaluru', expiresAt: hoursFromNow(-5), status: 'picked_up', claimedBy: feedBengaluru._id, donor: annapoorna._id },
    { title: 'Veg pulao', foodType: 'veg', servings: 45, pickupAddress: '45 Sayyaji Rao Road', city: 'Mysuru', expiresAt: hoursFromNow(-24), status: 'picked_up', claimedBy: mysuruCare._id, donor: greenLeaf._id },
    // expired
    { title: 'Paneer butter masala and naan', foodType: 'veg', servings: 20, pickupAddress: '45 Sayyaji Rao Road', city: 'Mysuru', expiresAt: hoursFromNow(-3), status: 'expired', donor: greenLeaf._id },
  ]);

  console.log('Seeded 4 users and 8 listings. All passwords: password123');
  console.log('  Donors: donor1@demo.com (Bengaluru), donor2@demo.com (Mysuru)');
  console.log('  NGOs:   ngo1@demo.com (Bengaluru), ngo2@demo.com (Mysuru)');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});
