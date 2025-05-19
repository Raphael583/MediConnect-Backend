export interface Slot {
  date: string;               
  startTime: string;          
  endTime: string;  
  doctorId: string,          
  status: 'available' | 'booked';
  userId?: string | null;
}
