import { Document, Types } from 'mongoose';

export interface User extends Document {
  email: string;
  password?: string;
  name: string;
  dob: Date;
  userType: 'patient' | 'doctor';
  hospitalId:Types.ObjectId;

}
