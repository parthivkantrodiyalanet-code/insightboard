import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  trialStartedAt: {
    type: Date,
  },
  trialEndsAt: {
    type: Date,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  stripeCustomerId: {
    type: String,
    default: null,
  },
  stripeSubscriptionId: {
    type: String,
    default: null,
  },
}, { 
  timestamps: true,
  toJSON: {
    transform(_doc, ret: Record<string, unknown>) {
      delete ret.password;
      return ret;
    }
  },
  toObject: {
    transform(_doc, ret: Record<string, unknown>) {
      delete ret.password;
      return ret;
    }
  }
});

const User = models.User || model('User', UserSchema);

export default User;
