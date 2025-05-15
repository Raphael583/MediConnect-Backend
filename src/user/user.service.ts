import { Injectable , NotFoundException, UnauthorizedException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './interfaces/user.interface';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { CreatePatientDto } from './dto/create-patient.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  
  async createDoctor(createDoctorDto: CreateDoctorDto): Promise<User> {
    const { email, password, name, dob } = createDoctorDto;
    const newDoctor = new this.userModel({ email,password,name,dob,userType: 'doctor'});
    return await newDoctor.save();
  }

  
  async createPatient(createPatientDto: CreatePatientDto): Promise<User> {
    const { email, password, name, dob } = createPatientDto;
    const newPatient = new this.userModel({email,password, name,dob,userType: 'patient'});
    return await newPatient.save();
  }

  
  async login(loginDto: LoginDto): Promise<any> {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.password !== password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, userType: user.userType };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {email: user.email,name: user.name,userType: user.userType,password: this.maskPassword(user.password)}
    };
  }

  maskPassword(password: string): string {
    return password.replace(/./g, '*');  
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userModel.findOne({ email }).exec();
  }
  async deleteOneName (id:string): Promise <User|null> {
          return await this.userModel.findOneAndDelete({_id:id}).exec();
}

async getNames (): Promise <User[]> {
        return await this.userModel.find({},{password:0}).exec();
    }
      async getOneName (id:string): Promise <User | null> {
        return await this.userModel.findById(id, {password:0}).exec();
    }
    async getPatientsOnly(): Promise<User[]> {
  return this.userModel.find({ userType: 'patient' },{password:0}).exec();
}

}
