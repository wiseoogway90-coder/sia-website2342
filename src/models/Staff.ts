import { Schema, models, model } from 'mongoose';

const StaffSchema = new Schema({
  username: { type: String, required: true, unique: true },
  discordUsername: { type: String },
  email: { type: String },
  password: { type: String, required: true },
  name: { type: String },
  role: { type: String },
  department: { type: String },
  status: { type: String, default: 'active' },
}, { timestamps: true });

export const Staff = models.Staff || model('Staff', StaffSchema);
