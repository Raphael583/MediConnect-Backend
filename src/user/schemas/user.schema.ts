import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

export const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  dob: { type: Date, required: true },
  userType: { type: String, enum: ['patient', 'doctor'], required: true },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'hospital' },

});
