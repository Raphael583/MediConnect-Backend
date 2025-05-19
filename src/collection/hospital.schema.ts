import { Schema } from 'mongoose';

export const HospitalSchema = new Schema({
  name: { type: String, required: true },          
  address: { type: String, required: true },       
  phone: { type: String, required: true },         
  email: { type: String, required: true },         
});