import { Schema } from 'mongoose';

export const PatientSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      match: [/^[6-9]\d{9}$/, 'Invalid mobile number'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      match: [/\S+@\S+\.\S+/, 'Invalid email format'],
    },
    identifier: {
      type: String,
      required: [true, 'Identifier is required'],
      unique: true,
    },
    isActivated: {
      type: Boolean,
      default: false,
    },
      dob: { type: Date, required: false },
    
  },
  {
    timestamps: true,
  }
);
