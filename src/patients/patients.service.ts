import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Patient } from './interfaces/patient.interface';
import { CreateCsvPatientDto } from './dto/csv-patient.dto';
import { JwtService } from '@nestjs/jwt';
import * as nodemailer from 'nodemailer';
import { Redis } from '@upstash/redis';

@Injectable()
export class PatientsService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  constructor(
    @InjectModel('Patient') private readonly patientModel: Model<Patient>,
    private readonly jwtService: JwtService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis
  ) {}

  // Existing CSV upload logic (UNCHANGED)
  async csvCreate(patients: CreateCsvPatientDto[]): Promise<Patient[]> {
    const savedPatients: Patient[] = [];

    for (const patient of patients) {
      const exists = await this.patientModel.findOne({
        $or: [{ email: patient.email }, { identifier: patient.identifier }],
      });

      if (!exists) {
        const created = new this.patientModel(patient);
        const saved = await created.save();
        savedPatients.push(saved);
      }
    }

    return savedPatients;
  }

  // Step 1: Send OTP to email using identifier
  async sendActivationOtp(identifier: string): Promise<any> {
    const patient = await this.patientModel.findOne({ identifier });

    if (!patient) {
      throw new NotFoundException('Patient not found with given identifier');
    }

    if (patient.isActivated) {
      throw new ForbiddenException('Your account is already activated.');
    }


    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const redisKey = `patient_otp:${identifier}`;
    await this.redis.set(redisKey, otp, { ex: 120 }); // valid for 2 minutes

    const mailOptions = {
      from: `"Patient Activation" <${process.env.GMAIL_USER}>`,
      to: patient.email,
      subject: 'OTP for Patient Account Activation',
      text: `Hello ${patient.name},\n\nYour OTP for activating your account is: ${otp}\nIt is valid for 2 minutes.\n\n- Hospital System`,
    };

    await this.transporter.sendMail(mailOptions);

    return { message: 'OTP sent to your email' };
  }

  // Step 2: Verify OTP and issue JWT
async verifyActivationOtp(identifier: string, otp: string): Promise<any> {
    
    const redisKey = `patient_otp:${identifier}`;
    const storedOtp = await this.redis.get(redisKey);
    

    if (!storedOtp) {
      console.error('No OTP found for this identifier or OTP expired');
      throw new BadRequestException('Invalid OTP');
    }

    const cleanStoredOtp = storedOtp.toString().trim();
    const cleanProvidedOtp = otp.toString().trim();

    if (cleanStoredOtp !== cleanProvidedOtp) {
      console.error(
        `OTP mismatch - Provided OTP (${cleanProvidedOtp}) does not match stored OTP (${cleanStoredOtp})`
      );
      throw new BadRequestException('Invalid OTP');
    }

    const patient = await this.patientModel.findOne({ identifier });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
if (patient.isActivated) {
  throw new ForbiddenException('Your account is already activated.');
}

    patient.isActivated = true;
    await patient.save();

    await this.redis.del(redisKey); // Clear OTP after success

    const payload = {
      id: patient._id,
      name: patient.name,
      email: patient.email,
      mobile: patient.mobile,
      identifier: patient.identifier,
      isActivated: patient.isActivated,
    };

    const token = this.jwtService.sign(payload);

    return {
      message: 'Account activated successfully',
      token,
      
    };
  }
}
