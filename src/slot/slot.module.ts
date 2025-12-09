import { Module } from '@nestjs/common';
import { SlotController } from './slot.controller';
import { SlotService } from './slot.service';
import { SlotSchema } from './schema/slot.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { RazorpayModule } from 'src/razorpay/razorpay.module';

@Module({
  imports:[
    MongooseModule.forFeature([{ name: 'Slot', schema: SlotSchema }]),
    RazorpayModule,
  ], 
  controllers: [SlotController],
  providers: [SlotService],
  exports:[SlotService],
})
export class SlotModule {}
