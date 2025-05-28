
import { Document } from 'mongoose';

export interface Patient extends Document {
  name: string;
  mobile: string;
  email: string;
  identifier: string;
}
