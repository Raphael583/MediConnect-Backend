import * as mongoose from 'mongoose';

export const HospitalSchema = new mongoose.Schema({
  name: String,
  age: Number,
  disease: String,
  admitted: Boolean,
});
