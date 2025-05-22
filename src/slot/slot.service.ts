import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {Model}from 'mongoose';
import { CreateSlotDto } from './dto/slot.dto';
import { Slot } from './interfaces/slot.interface';
import * as moment from 'moment';


@Injectable()
export class SlotService {

     constructor(
    @InjectModel('Slot') private readonly slotModel: Model<Slot>,
  ) {}

 async createMultipleSlots(doctorId: string, dtos: CreateSlotDto[]): Promise<Slot[]> {
  const slots = dtos.map(dto => ({
    ...dto,
    doctorId,
    status: 'available' as const,
    userId: null,
  }));

  return await this.slotModel.insertMany(slots) as Slot[];
}
n
async bookSlot(slotId: string, userId: string): Promise<Slot> {
  const slot = await this.slotModel.findOne({ _id: slotId, status: 'available' });

  if (!slot) {
    throw new BadRequestException('Slot not available or already booked');
  }

  
  const today = moment().startOf('day');
  const slotDate = moment(slot.date, 'YYYY-MM-DD').startOf('day');

  if (slotDate.isBefore(today)) {
    throw new BadRequestException('Cannot book slots in the past');
  }

  const existingBooking = await this.slotModel.findOne({
    userId: userId,
    doctorId: slot.doctorId,
    date: slot.date,
    status: 'booked',
  });

  if (existingBooking) {
    throw new BadRequestException('You have already booked a slot with this doctor on this date');
  }

  slot.status = 'booked';
  slot.userId = userId;

  return await slot.save();
}

async getSlotBookingStatusForDoctor(doctorId: string): Promise<any> {
  const allSlots = await this.slotModel.find({ doctorId });

  if (allSlots.length === 0) {
    return { message: 'Doctor has no slots created yet' };
  }

  const slotStatuses = allSlots.map(slot => ({
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    status: slot.status,
    message: slot.status === 'booked' ? 'This slot is booked' : 'This slot is not booked'
  }));

  return {
    doctorId,
    totalSlots: allSlots.length,
    slots: slotStatuses
  };
}

async cancelSlot(slotId: string, userId: string): Promise<Slot> {
  const slot = await this.slotModel.findOne({ _id: slotId });

  if (!slot || slot.status !== 'booked' || slot.userId !== userId) {
    throw new BadRequestException('Invalid cancellation request');
  }

  slot.status = 'available';
  slot.userId = null;

  return await slot.save();
}

}



 