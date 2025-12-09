export interface Slot {
  _id?: string;
  date: Date;               
  doctorId: string;
  status: 'available' | 'booked';
  userId?: string | null;
  called?: boolean;
}
