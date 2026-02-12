import { Schema, models, model } from 'mongoose';

const CustomPasswordSchema = new Schema({
  staffId: { type: Schema.Types.ObjectId, ref: 'Staff', unique: true, required: true },
  passwordHash: { type: String, required: true },
}, { timestamps: true });

export const CustomPassword = models.CustomPassword || model('CustomPassword', CustomPasswordSchema);
