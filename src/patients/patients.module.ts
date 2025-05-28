import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PatientSchema } from './schema/patient.schema';
import { PatientController } from './patients.controller';
import { PatientsService } from './patients.service';

@Module({
  imports:[
    MongooseModule.forFeature([{name:'Patient', schema:PatientSchema}]),
  ],
  controllers: [PatientController],
  providers: [PatientsService]
})
export class PatientsModule {}

