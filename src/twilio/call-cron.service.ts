import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SlotService } from 'src/slot/slot.service';
import { TwilioService } from './twilio.service';
import { PatientsService } from 'src/patients/patients.service';
import * as moment from 'moment';

@Injectable()
export class CallCronService {
  private readonly logger = new Logger(CallCronService.name);

  constructor(
    private readonly slotService: SlotService,
    private readonly twilioService: TwilioService,
    private readonly patientsService: PatientsService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.log('Cron is running ...');

    // Always operate in UTC
    const nowUTC = moment.utc();
    const targetUTC = nowUTC.add(15, 'minutes'); // slot should start in 15 min

    const upcomingSlots = await this.slotService.findSlotsForCron(
      targetUTC.toDate()
    );

    for (const slot of upcomingSlots) {
      try {
        this.logger.log(`Calling user ${slot.userId} for slot ${slot._id}`);

        const patient = await this.patientsService.findById(slot.userId!);

        if (!patient) {
          this.logger.error(`Patient not found for userId ${slot.userId}`);
          continue;
        }

        if (!patient.mobile) {
          this.logger.error(`No mobile number for patient ${slot.userId}`);
          continue;
        }

        const patientNumber = `+91${patient.mobile}`;

        await this.twilioService.createCall(
          patientNumber,
          slot._id.toString(),
        );

        await this.slotService.markSlotCalled(slot._id.toString());
      } catch (err) {
        this.logger.error('Error making reminder call:', err);
      }
    }
  }
}
