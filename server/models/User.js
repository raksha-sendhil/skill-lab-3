const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['donor', 'ngo'], required: true },
    phone: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
  },
  { timestamps: true, versionKey: false }
);

// Never send the password hash to the client
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
