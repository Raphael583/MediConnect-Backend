import { Module } from '@nestjs/common';
import { SlotController } from './slot.controller';
import { SlotService } from './slot.service';
import { SlotSchema } from './schema/slot.schema';
import {UserSchema} from '../user/schemas/user.schema';
import {PatientSchema} from '../patients/schema/patient.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { RazorpayModule } from 'src/razorpay/razorpay.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports:[
    MongooseModule.forFeature([{ name: 'Slot', schema: SlotSchema },
         { name: 'User', schema: UserSchema },       // ✅ doctor
      { name: 'Patient', schema: PatientSchema },
    ]),
    RazorpayModule,
    NotificationsModule,
  ], 
  controllers: [SlotController],
  providers: [SlotService],
  exports:[SlotService],
})
export class SlotModule {}
