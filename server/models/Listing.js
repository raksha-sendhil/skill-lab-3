const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    foodType: { type: String, enum: ['veg', 'non-veg', 'mixed'], required: true },
    servings: { type: Number, required: true, min: 1 },
    pickupAddress: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    expiresAt: { type: Date, required: true },
    notes: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['available', 'claimed', 'picked_up', 'expired'],
      default: 'available',
    },
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('Listing', listingSchema);
