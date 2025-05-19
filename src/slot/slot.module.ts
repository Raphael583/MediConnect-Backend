import { Module } from '@nestjs/common';
import { SlotController } from './slot.controller';
import { SlotService } from './slot.service';
import { SlotSchema } from './schema/slot.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports:[
    MongooseModule.forFeature([{ name: 'Slot', schema: SlotSchema }]),
  ], 
  controllers: [SlotController],
  providers: [SlotService]
})
export class SlotModule {}
