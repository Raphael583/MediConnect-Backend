import { Schema } from 'mongoose';

export const SlotSchema = new Schema({
  // FULL UTC Date-Time (includes both date + time)
  date: { type: Date, required: true },

  doctorId: { type: String, required: true },

  status: {
    type: String,
    enum: ['available', 'booked'],
    default: 'available'
  },

  userId: { type: String, default: null },

  called: { type: Boolean, default: false }
});
