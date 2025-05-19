import { Schema } from 'mongoose';

export const SlotSchema = new Schema({
  date: { type: Date, required: true },             
  startTime: { type: String, required: true },      
  endTime: { type: String, required: true },
   doctorId: { type: String, required: true },         
  status: { type: String, enum: ['available', 'booked'], default: 'available' },
  userId: { type: String, default: null },  
});    
