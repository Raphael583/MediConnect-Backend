import { Module } from '@nestjs/common';
import { HospitalController } from './hospital.controller';
import { HospitalService } from './hospital.service'
import { MongooseModule } from '@nestjs/mongoose';
import { HospitalSchema } from 'src/collection/hospital.schema';


@Module({
  imports:[MongooseModule.forFeature([{ name: 'hospital', schema: HospitalSchema }])],
  controllers: [HospitalController],
  providers: [HospitalService]
})
export class HospitalModule {}
