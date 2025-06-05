import { Controller, Post, Body, Get, Param, Delete, BadRequestException } from '@nestjs/common';
import { SlotService } from './slot.service';
import { CreateSlotDto } from './dto/slot.dto';
import { BookSlotDto } from './dto/bookslot.dto';
import { CancelSlotDto } from './dto/cancelslot.dto';
import { RazorpayService } from 'src/razorpay/razorpay.service';

@Controller('slot')
export class SlotController {
        constructor(private readonly slotService: SlotService, private readonly razorpayService:RazorpayService) {}

 @Post('insert')
async createMultipleSlots(@Body() body: { doctorId: string; slots: CreateSlotDto[] }) {
  return this.slotService.createMultipleSlots(body.doctorId, body.slots);
}
@Post('bookslot')
async bookSlot(@Body() bookSlotDto: BookSlotDto) {
  return this.slotService.bookSlot(bookSlotDto.slotId, bookSlotDto.userId);
}
@Get('docstatus/:doctorId')
async getDoctorSlotStatuses(@Param('doctorId') doctorId: string) {
  return this.slotService.getSlotBookingStatusForDoctor(doctorId);
}

@Delete('cancel')
async cancelSlot(@Body() cancelDto: CancelSlotDto) {
  return this.slotService.cancelSlot(cancelDto.slotId, cancelDto.userId);
}

  @Get('doctor/today/:doctorId')
  getTodaysAppointmentsForDoctor(@Param('doctorId') doctorId: string) {
    return this.slotService.getTodaysAppointmentsForDoctor(doctorId);
  }

  @Get('doctor/upcoming/:doctorId')
  getUpcomingAppointmentsForDoctor(@Param('doctorId') doctorId: string) {
    return this.slotService.getUpcomingAppointmentsForDoctor(doctorId);
  }

  @Get('patient/today/:userId')
  getTodaysAppointmentsForPatient(@Param('userId') userId: string) {
    return this.slotService.getTodaysAppointmentsForPatient(userId);
  }

  @Get('patient/upcoming/:userId')
  getUpcomingAppointmentsForPatient(@Param('userId') userId: string) {
    return this.slotService.getUpcomingAppointmentsForPatient(userId);
  }

  @Post('create-payment-order')
  async createPaymentOrder(@Body() body: { slotId: string; userId: string }) {
    const { slotId, userId } = body;

    const slot = await this.slotService.validateSlotForBooking(slotId, userId);
    if (!slot) {
      throw new BadRequestException('Slot not available or already booked');
    }

    const amount = 500; // Customize per hospital/slot if needed

    const order = await this.razorpayService.createOrder(amount);

    return {
      razorpayOrder: order,
      slotId,
      amount,
      currency: 'INR',
    };
  }
}

