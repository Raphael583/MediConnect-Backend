import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { twiml } from 'twilio';

@Controller('twiml')
export class TwimlController {
  @Get('reminder')
  handleReminder(
    @Query('slotId') slotId: string,
    @Query('name') name: string,   
    @Res() res: Response
  ) {
    const vr = new twiml.VoiceResponse();

    const userName = name || "there";  

    vr.say(
      { voice: "Polly.Joanna", language: "en-US" },
      `Hello ${userName}. This is a reminder for your upcoming appointment in fifteen minutes.`
    );

    vr.pause({ length: 1 });

    const gather1 = vr.gather({
      numDigits: 1,
      action: `/ivr/handle-choice?slotId=${slotId}&attempt=1`,
      method: "POST",
    });

    gather1.say(
      { voice: "Polly.Joanna", language: "en-US" },
      "Press 1 to confirm your appointment. Press 2 to cancel. Press 3 to reschedule."
    );

    
    vr.say(
      { voice: "Polly.Joanna", language: "en-US" },
      "We haven’t received any input."
    );

   
    const gather2 = vr.gather({
      numDigits: 1,
      action: `/ivr/handle-choice?slotId=${slotId}&attempt=2`,
      method: "POST",
    });

    gather2.say(
      { voice: "Polly.Joanna", language: "en-US" },
      "Please respond now. Press 1 to confirm, press 2 to cancel, or press 3 to reschedule your appointment."
    );

 
    vr.say(
      { voice: "Polly.Joanna", language: "en-US" },
      "We still did not receive any input. We are cancelling this current appointment. You may book a new appointment at your convenient time. Goodbye."
    );

    res.type("text/xml").send(vr.toString());
  }
}
