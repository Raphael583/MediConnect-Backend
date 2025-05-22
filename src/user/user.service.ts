import { Injectable , Inject, NotFoundException, ForbiddenException, UnauthorizedException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hospital } from 'src/hospital/interface/hospital.interface';
import { User } from './interfaces/user.interface';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { CreatePatientDto } from './dto/create-patient.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { Redis } from '@upstash/redis';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('hospital') private readonly hospitalModel:Model<Hospital>,
    private readonly jwtService: JwtService,
    @Inject('REDIS_CLIENT') private readonly redis: any,
  ) {}
  
  async createDoctor(createDoctorDto: CreateDoctorDto): Promise<User> {
    const { email, password, name, dob, hospitalId } = createDoctorDto;
    const newDoctor = new this.userModel({ email,password,name,dob,hospitalId,userType: 'doctor'});
    return await newDoctor.save();
  }

  
  async createPatient(createPatientDto: CreatePatientDto): Promise<User> {
    const { email, password, name, dob, hospitalId } = createPatientDto;
    const newPatient = new this.userModel({email,password, name,dob,hospitalId, userType: 'patient'});
    return await newPatient.save();
  }
async login(loginDto: LoginDto): Promise<any> {
  const { email, password } = loginDto;
  const user = await this.userModel.findOne({ email });

   if (!user) throw new NotFoundException('User not found');
    if (user.password !== password) throw new UnauthorizedException('Invalid credentials');

  // Generate OTP (6-digit)
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const redisKey = `otp:${email}`;

   await this.redis.set(redisKey, otp, { ex: 120 });

    console.log(`OTP for ${email}: ${otp}`);


  return {
    message: 'OTP sent to your email (check server logs for now)',
    email: email,
  };
}
async verifyOtp(email: string, otp: string): Promise<any> {
  // Normalize inputs
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedOtp = otp.trim();

  const redisKey = `otp:${normalizedEmail}`;
  const storedOtp = await this.redis.get(redisKey);

  console.log(`Stored OTP: ${storedOtp}, Provided OTP: ${normalizedOtp}`);

  if (!storedOtp) {
    throw new UnauthorizedException('OTP expired or not found');
  }

  if (String(storedOtp) !== String(normalizedOtp)) {
    throw new UnauthorizedException('Invalid OTP');
  }

  // OTP matched, delete it
  await this.redis.del(redisKey);

  // Find user with case-insensitive email
  const user = await this.userModel.findOne({
    email: new RegExp(`^${normalizedEmail}$`, 'i'),
  });

  console.log('User fetched after OTP verification:', user);

  if (!user) {
    throw new NotFoundException('User not found');
  }

  // Create JWT token
  const payload = {
    email: user.email,
    userType: user.userType,
    hospitalId: user.hospitalId,
  };

  const token = this.jwtService.sign(payload);

  return {
    access_token: token,
    user: {
      email: user.email,
      name: user.name,
      userType: user.userType,
      hospitalId: user.hospitalId,
    },
  };
}

  async findByEmail(email: string): Promise<User | null> {
    return await this.userModel.findOne({ email }).exec();
  }
  async deleteOneName(id: string): Promise<User | null> {
  return await this.userModel.findOneAndDelete({ _id: id }).exec();
}

async updatePatient(id: string, data: any): Promise<User | null> {
  return this.userModel.findByIdAndUpdate(id, data, { new: true }).exec();
}
async searchPatients(name?: string, email?: string, dob?: string): Promise<User[]> {
  const filters: any = { userType: 'patient' };

  if (name) {
    filters.name = { $regex: name, $options: 'i' };
  }

  if (email) {
    filters.email = { $regex: email, $options: 'i' };
  }

  if (dob) {
    filters.dob = { $regex: dob, $options: 'i' };
  }

  const results = await this.userModel.find(filters, { password: 0 }).exec();

  if (results.length === 0) {
    throw new NotFoundException('No matching records found');
  }

  return results;
}
async getPatientsOnly(hospitalId:string): Promise<User[]> {
  return this.userModel.find({ userType: 'patient', hospitalId },{password:0}).exec();
}

async getNames (): Promise <User[]> {
        return await this.userModel.find({},{password:0}).exec();
    }
      async getOneName(id: string, doctorHospitalId: string): Promise<User | null> {
  const patient = await this.userModel.findById(id, { password: 0 }).exec();

  if (!patient) {
    throw new NotFoundException('Patient not found');
  }

  if (patient.userType !== 'patient') {
    throw new ForbiddenException('This is not a patient record');
  }

  if (patient.hospitalId.toString()!== doctorHospitalId.toString()) {
    throw new ForbiddenException('Access denied: Patient belongs to a different hospital');
  }

  return patient;
}

    
 async getHospitalWithPatients(hospitalId: string): Promise<any> {
    const hospital = await this.hospitalModel.findById(hospitalId).exec();

    if (!hospital) {
      throw new NotFoundException('Hospital not found');
    }

    const patients = await this.userModel.find(
      { hospitalId, userType: 'patient' },
      { password: 0 } 
    ).exec();

    return {
      hospital: {
        name: hospital.name,
        address: hospital.address,
        phone: hospital.phone,
        email: hospital.email,
      },
      patients,
    };
  }
}


