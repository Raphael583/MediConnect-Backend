import { Controller, Post, Query, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { twiml } from 'twilio';
import { SlotService } from 'src/slot/slot.service';
import * as moment from 'moment-timezone';

@Controller('ivr')
export class IvrController {
  constructor(private readonly slotService: SlotService) {}

  @Post('handle-choice')
  async handleChoice(
    @Query('slotId') slotId: string,
    @Query('attempt') attempt: string,    
    @Body() body: any,
    @Res() res: Response,
  ) {
    const digit = body.Digits;
    const response = new twiml.VoiceResponse();

    
    if (digit === '1') return this.confirm(slotId, res);
    if (digit === '2') return this.cancel(slotId, res);
    if (digit === '3') return this.reschedule(slotId, res);

    // If NO INPUT and this was 2nd attempt → auto cancel
    if (!digit && attempt === "2") {
      const slot = await this.slotService.findSlotById(slotId);
      if (slot) await this.slotService.cancelSlot(slotId, slot.userId!);

      response.say(
        { voice: "Polly.Joanna", language: "en-US" },
        "We did not receive any input again. Your appointment has been cancelled. Goodbye."
      );
      return res.type("text/xml").send(response.toString());
    }

    
    response.say(
      { voice: "Polly.Joanna", language: "en-US" },
      "No input detected."
    );
    return res.type("text/xml").send(response.toString());
  }

  async confirm(slotId: string, res: Response) {
    const response = new twiml.VoiceResponse();
    response.say(
      { voice: "Polly.Joanna", language: "en-US" },
      "Your appointment has been confirmed. Thank you."
    );
    return res.type("text/xml").send(response.toString());
  }

  async cancel(slotId: string, res: Response) {
    const response = new twiml.VoiceResponse();

    const slot = await this.slotService.findSlotById(slotId);
    if (!slot) {
      response.say(
        { voice: "Polly.Joanna", language: "en-US" },
        "Could not find your appointment."
      );
      return res.type("text/xml").send(response.toString());
    }

    await this.slotService.cancelSlot(slotId, slot.userId!);

    response.say(
      { voice: "Polly.Joanna", language: "en-US" },
      "Your appointment has been cancelled."
    );

    return res.type("text/xml").send(response.toString());
  }

  async reschedule(slotId: string, res: Response) {
    const response = new twiml.VoiceResponse();
    const slot = await this.slotService.findSlotById(slotId);

    if (!slot) {
      response.say(
        { voice: "Polly.Joanna", language: "en-US" },
        "Could not find your appointment."
      );
      return res.type("text/xml").send(response.toString());
    }

    const available = await this.slotService.findAvailableSlotsNearby(
      slot.doctorId,
    );

    if (available.length === 0) {
      response.say(
        { voice: "Polly.Joanna", language: "en-US" },
        "No available slots found for rescheduling."
      );
      return res.type("text/xml").send(response.toString());
    }

    const gather = response.gather({
      numDigits: 1,
      action: `/ivr/choose-slot?slotId=${slotId}`,
      method: "POST",
    });

    gather.say(
      { voice: "Polly.Joanna", language: "en-US" },
      "Here are the next available slots."
    );

    available.forEach((s, index) => {
      const localTime = moment(s.date).tz("Asia/Kolkata").format("HH:mm");
      const localDate = moment(s.date).tz("Asia/Kolkata").format("YYYY-MM-DD");

      gather.say(
        { voice: "Polly.Joanna", language: "en-US" },
        `Press ${index + 1} for ${localDate} at ${localTime}`
      );
    });

    response.say(
      { voice: "Polly.Joanna", language: "en-US" },
      "No input received. Goodbye."
    );

    return res.type("text/xml").send(response.toString());
  }

  @Post('choose-slot')
  async chooseSlot(
    @Query('slotId') oldSlotId: string,
    @Body() body: any,
    @Res() res: Response
  ) {
    const index = Number(body.Digits);
    const response = new twiml.VoiceResponse();

    const oldSlot = await this.slotService.findSlotById(oldSlotId);

    if (!oldSlot) {
      response.say(
        { voice: "Polly.Joanna", language: "en-US" },
        "We could not find your appointment."
      );
      return res.type("text/xml").send(response.toString());
    }

    const available = await this.slotService.findAvailableSlotsNearby(
      oldSlot.doctorId
    );

    const newSlot = available[index - 1];
    if (!newSlot) {
      response.say(
        { voice: "Polly.Joanna", language: "en-US" },
        "Invalid option selected."
      );
      return res.type("text/xml").send(response.toString());
    }

    await this.slotService.cancelSlot(oldSlotId, oldSlot.userId!);
    await this.slotService.bookSlot(newSlot._id.toString(), oldSlot.userId!);

    const localTime = moment(newSlot.date).tz("Asia/Kolkata").format("HH:mm");
    const localDate = moment(newSlot.date).tz("Asia/Kolkata").format("YYYY-MM-DD");

    response.say(
      { voice: "Polly.Joanna", language: "en-US" },
      `Your appointment has been rescheduled to ${localDate} at ${localTime}. Thank you.`
    );

    return res.type("text/xml").send(response.toString());
  }
}
