import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TwilioService } from '../twilio/twilio.service';
import { CallsController } from '../twilio/calls.controller';
import { TwimlController } from './twiml.controller';
import { IvrController } from './ivr.controller';
import { CallCronService } from './call-cron.service';
import { SlotModule } from 'src/slot/slot.module';
import {PatientsModule } from '../patients/patients.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ConfigModule, SlotModule,PatientsModule, ScheduleModule],
  controllers: [CallsController, TwimlController, IvrController],
  providers: [TwilioService, CallCronService],
  exports: [TwilioService],
})
export class TwilioModule {}
