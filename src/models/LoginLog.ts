import { Schema, models, model } from 'mongoose';

const LoginLogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
  username: { type: String, required: true },
  name: { type: String },
  role: { type: String },
  loginType: { type: String },
  discordInput: { type: String },
  timestamp: { type: Date, default: Date.now },
  ipAddress: { type: String },
}, { timestamps: true });

export const LoginLog = models.LoginLog || model('LoginLog', LoginLogSchema);
