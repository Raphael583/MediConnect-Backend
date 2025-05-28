import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Patient } from './interfaces/patient.interface';
import { CreateCsvPatientDto } from './dto/csv-patient.dto';
import { privateDecrypt } from 'crypto';

@Injectable()
export class PatientsService {
    constructor(
        @InjectModel('Patient') private readonly patientModel: Model<Patient>,
    ){}

    async csvCreate(patients:CreateCsvPatientDto[]):Promise<Patient[]>{
         const savedPatients: Patient[] = [];

    for (const patient of patients) {
      // Check if patient exists by email or identifier
      const exists = await this.patientModel.findOne({
        $or: [{ email: patient.email }, { identifier: patient.identifier }],
      });

      if (!exists) {
        // Create and save new patient
        const created = new this.patientModel(patient);
        const saved = await created.save();
        savedPatients.push(saved);
      }
      // If patient exists, skip insertion
    }

    return savedPatients;
  }
}

    
