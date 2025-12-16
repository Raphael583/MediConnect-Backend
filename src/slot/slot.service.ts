import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {User} from '../user/interfaces/user.interface';
import { Patient } from '../patients/interfaces/patient.interface';

import { Model } from 'mongoose';
import { CreateSlotDto } from './dto/slot.dto';
import { Slot } from './interfaces/slot.interface';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';
import * as moment from 'moment-timezone';

@Injectable()
export class SlotService {
  constructor(
    @InjectModel('Slot') private readonly slotModel: Model<Slot>,
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('Patient')private readonly patientModel: Model<Patient>,
    private readonly notificationsGateway:NotificationsGateway,

  ) {}

  private getTodayUTC(): Date {
    return moment.utc().startOf('day').toDate();
  }

  //to create multiple slots 
  async createMultipleSlots(doctorId: string, dtos: CreateSlotDto[]): Promise<Slot[]> {
    const slots = dtos.map(dto => {
      // Convert local IST input to UTC date object
      const localDateTime = moment.tz(
        `${dto.date} ${dto.startTime}`,
        'YYYY-MM-DD HH:mm',
        'Asia/Kolkata'
      );

      const utcDate = localDateTime.utc().toDate(); // REAL UTC

      return {
        doctorId,
        date: utcDate, // UTC stored in DB
        status: 'available',
        userId: null,
        called: false,
      };
    });

    return await this.slotModel.insertMany(slots) as unknown as Slot[];
  }

  //to find slot by id
  async findSlotById(slotId: string) {
    return this.slotModel.findById(slotId);
  }

  //to find the available slots nearby
  async findAvailableSlotsNearby(doctorId: string) {
    return this.slotModel
      .find({
        doctorId,
        status: 'available',
      })
      .sort({ date: 1 })
      .limit(3);
  }

  // Called by Cron – find slot whose UTC datetime ≈ target UTC datetime
  async findSlotsForCron(targetDateTime: Date) {
    const start = new Date(targetDateTime.getTime() - 30 * 1000);
    const end = new Date(targetDateTime.getTime() + 30 * 1000);

    return this.slotModel.find({
      date: { $gte: start, $lte: end },
      status: 'booked',
      called: false,
    });
  }

  async markSlotCalled(slotId: string) {
    return this.slotModel.findByIdAndUpdate(slotId, { called: true });
  }

  async bookSlot(slotId: string, userId: string): Promise<Slot> {
    const slot = await this.slotModel.findOne({
      _id: slotId,
      status: 'available',
    });

    if (!slot) throw new BadRequestException('Slot not available or already booked');

    const nowUTC = moment.utc().startOf('day');
    const slotDayUTC = moment.utc(slot.date).startOf('day');

    if (slotDayUTC.isBefore(nowUTC)) {
      throw new BadRequestException('Cannot book slots in the past');
    }

    const existingBooking = await this.slotModel.findOne({
      userId,
      doctorId: slot.doctorId,
      date: slot.date,
      status: 'booked',
    });

    if (existingBooking) {
      throw new BadRequestException(
        'You have already booked a slot with this doctor on this date'
      );
    }

    slot.status = 'booked';
    slot.userId = userId;

    const saved = await slot.save();

const doctor = await this.userModel.findById(slot.doctorId);
const patient = await this.patientModel.findById(userId);


//  Emit real-time event to doctor
this.notificationsGateway.emitToDoctor(
  slot.doctorId,
  'appointmentBooked',
  {

  date: saved.date,                    // UTC datetime
  doctorName: doctor?.name || 'Doctor',
  patientName: patient?.name || 'Patient',
    /*slotId: saved._id,
    doctorId: slot.doctorId,
    userId,
    date: saved.date,*/
  },
);

    return await slot.save();
  }

  async cancelSlot(slotId: string, userId: string): Promise<Slot> {
    const slot = await this.slotModel.findOne({ _id: slotId });

    if (!slot || slot.status !== 'booked' || slot.userId !== userId) {
      throw new BadRequestException('Invalid cancellation request');
    }

    slot.status = 'available';
    slot.userId = null;
const saved = await slot.save();

//  Emit cancellation event
this.notificationsGateway.emitToDoctor(
  slot.doctorId,
  'appointmentCancelled',
  {
    slotId: saved._id,
    doctorId: slot.doctorId,
    userId,
    date: saved.date,
  },
);
    return await slot.save();
  }

  // Doctor today's appointments (UTC)
  async getTodaysAppointmentsForDoctor(doctorId: string) {
    const startOfDay = moment.utc().startOf('day').toDate();
    const endOfDay = moment.utc().endOf('day').toDate();

    const slots = await this.slotModel.find({
      doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: 'booked',
    });

    if (slots.length === 0) return { message: 'No appointments for today' };
    return slots;
  }
   // NEW: used by SlotController -> /slot/docstatus/:doctorId
  async getSlotBookingStatusForDoctor(doctorId: string): Promise<any> {
    const allSlots = await this.slotModel.find({ doctorId });

    if (allSlots.length === 0) {
      return { message: 'Doctor has no slots created yet' };
    }

    const slotStatuses = allSlots.map(slot => {
      const local = moment(slot.date).tz('Asia/Kolkata');
      return {
        dateUTC: slot.date,
        dateLocal: local.format('YYYY-MM-DD'),
        timeLocal: local.format('HH:mm'),
        status: slot.status,
        message:
          slot.status === 'booked'
            ? 'This slot is booked'
            : 'This slot is not booked',
      };
    });

    return {
      doctorId,
      totalSlots: allSlots.length,
      slots: slotStatuses,
    };
  }

  async getUpcomingAppointmentsForDoctor(doctorId: string) {
    const today = moment.utc().toDate();

    const slots = await this.slotModel.find({
      doctorId,
      date: { $gt: today },
      status: 'booked',
    });

    if (slots.length === 0) return { message: 'No upcoming appointments found' };
    return slots;
  }

  async getTodaysAppointmentsForPatient(userId: string) {
    const startOfDay = moment.utc().startOf('day').toDate();
    const endOfDay = moment.utc().endOf('day').toDate();

    const slots = await this.slotModel.find({
      userId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: 'booked',
    });

    if (slots.length === 0) return { message: 'You have no appointments today' };
    return slots;
  }

  async getUpcomingAppointmentsForPatient(userId: string) {
    const nowUTC = moment.utc().toDate();

    const slots = await this.slotModel.find({
      userId,
      date: { $gt: nowUTC },
      status: 'booked',
    });

    if (slots.length === 0) return { message: 'You have no upcoming appointments' };
    return slots;
  }

  async validateSlotForBooking(slotId: string, userId: string) {
    const slot = await this.slotModel.findOne({ _id: slotId, status: 'available' });
    if (!slot) return null;

    const existing = await this.slotModel.findOne({
      userId,
      doctorId: slot.doctorId,
      date: slot.date,
      status: 'booked',
    });

    if (existing) return null;

    return slot;
  }
}
