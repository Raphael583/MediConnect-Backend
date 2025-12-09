import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
import { SlotService } from 'src/slot/slot.service';
import { PatientsService } from 'src/patients/patients.service';

@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name);
  private twilioClient: Twilio;

  private readonly fromNumber: string;
  private readonly publicBaseUrl: string;

  constructor(
    private configService: ConfigService,
    private readonly slotService: SlotService,
    private readonly patientsService: PatientsService,
  ) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');

    this.fromNumber = this.configService.get<string>('TWILIO_PHONE_NUMBER')!;
    this.publicBaseUrl = this.configService.get<string>('PUBLIC_BASE_URL')!;

    this.twilioClient = new Twilio(accountSid, authToken);
  }

  
  getReminderUrl(slotId: string, name: string) {
    return `${this.publicBaseUrl}/twiml/reminder?slotId=${slotId}&name=${encodeURIComponent(
      name,
    )}`;
  }

 
  async createCall(toNumber: string, slotId: string) {

    
    const slot: any = await this.slotService.findSlotById(slotId);

    
    const patient: any = await this.patientsService.findById(slot.userId);

    const name = patient?.name || "there"; // fallback name

    
    const url = this.getReminderUrl(slotId, name);

    
    const call = await this.twilioClient.calls.create({
      to: toNumber,
      from: this.fromNumber,
      url,  // Twilio will GET this URL for instructions
      method: 'GET',
    });

    return call;
  }
}
