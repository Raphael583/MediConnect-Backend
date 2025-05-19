import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { SlotService } from './slot.service';
import { CreateSlotDto } from './dto/slot.dto';
import { BookSlotDto } from './dto/bookslot.dto';
import { CancelSlotDto } from './dto/cancelslot.dto';

@Controller('slot')
export class SlotController {
        constructor(private readonly slotService: SlotService) {}

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
}
