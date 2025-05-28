  import { Injectable , Inject, NotFoundException, BadRequestException, ForbiddenException, UnauthorizedException} from '@nestjs/common';
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
  import * as nodemailer from 'nodemailer';

  @Injectable()
  export class UserService {
      private transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
  });
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

    //  Check if the account is blocked
    if (user.isBlocked) {
      throw new ForbiddenException('Your account has been blocked due to multiple failed login attempts.');
    }

    const redisKey = `failed-login:${email}`;
    const maxAttempts = 6;

    //  Wrong password
    if (user.password !== password) {
      const failedAttempts = await this.redis.incr(redisKey);

      // Set expiry for Redis key 
      if (failedAttempts === 1) {
        await this.redis.expire(redisKey, 180); // 3 mins
      }

      const remaining = maxAttempts - failedAttempts;

      if (remaining <= 0) {
        //  Block the account
        user.isBlocked = true;
        await user.save();

        // Clear Redis key
        await this.redis.del(redisKey);

        throw new ForbiddenException('Your account has been blocked due to multiple failed login attempts.');
      }

      throw new UnauthorizedException(`Invalid credentials. You have ${remaining} attempt(s) left before your account gets blocked.`);
    }

    //  Successful login — reset failed attempt counter
    await this.redis.del(redisKey);

    //  Generate OTP (6-digit)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpKey = `otp:${email}`;
    await this.redis.set(otpKey, otp, { ex: 120 }); // 2 minutes

    
  // Send OTP email
  const mailOptions = {
    from: `" Hospital Authentication" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Your OTP for Login',
    text: `Your OTP is: ${otp}. It is valid for 2 minutes. Don't share it with anyone.`,
  };

  try {
    await this.transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }

  return {
    message: 'OTP sent to your email.',
    email,
  };
}

    //console.log(`OTP for ${email}: ${otp}`);

    //return {
     // message: 'OTP sent to your email (check server logs for now)',
      //email,
    //};
  //}

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
  async unblockUserByField(type: string, value: string, currentUser: any): Promise<any> {
    if (currentUser.userType !== 'doctor') {
      throw new ForbiddenException('Only doctors can unblock users');
    }

    let query: any = {};

    switch (type) {
      case 'id':
        query._id = value;
        break;
      case 'email':
        query.email = new RegExp(`^${value}$`, 'i');
        break;
      case 'name':
        query.name = new RegExp(`^${value}$`, 'i');
        break;
      default:
        throw new BadRequestException('Invalid type. Must be id, email, or name.');
    }

    const user = await this.userModel.findOne(query);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isBlocked) {
      return { message: 'User is already unblocked' };
    }

    user.isBlocked = false;
    await user.save();

    return { message: `User (${user.email}) has been unblocked successfully` };
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


