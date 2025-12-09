import { Body, Controller, Post } from '@nestjs/common';
import { TwilioService } from './twilio.service';
import { InitiateCallDto } from './dto/initiate-call.dto';

@Controller('calls')
export class CallsController {
  constructor(private twilioService: TwilioService) {}

  @Post('test')
  async testCall(@Body() body: InitiateCallDto) {
    const call = await this.twilioService.createCall(
      body.toNumber,
      body.slotId,
    );

    return {
      message: 'Call initiated',
      callSid: call.sid,
    };
  }
}
