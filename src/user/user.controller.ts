import { Controller, Post, Put, Delete, Param, BadRequestException, Get, Body,Headers, UseGuards,  Req, ForbiddenException,Query, Head } from '@nestjs/common';
import { UserService } from './user.service';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { CreatePatientDto } from './dto/create-patient.dto';
import { LoginDto } from './dto/login.dto';
import { User } from './interfaces/user.interface';
import { AuthGuard } from '@nestjs/passport';
import { ValidationPipe, UsePipes } from '@nestjs/common';
import { CreateUserFromPatientDto } from './dto/create-user-from-paitent.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create-doctor')
  async createDoctor(
    @Body() createDoctorDto: CreateDoctorDto,
    @Headers('hospitalid') hospitalId: string,
  ) {
    if (!hospitalId) {
      throw new BadRequestException('Missing hospitalId in headers');
    }
    const doctor = await this.userService.createDoctor({ ...createDoctorDto, hospitalId });
    return { message: 'Doctor created successfully', doctor };
  }
  
  @Post('create-patient')
  async createPatient(
    @Body() createPatientDto: CreatePatientDto,
    @Headers('hospitalid') hospitalId: string,
  ) {
    if (!hospitalId) {
      throw new BadRequestException('Missing hospitalId in headers');
    }

    const patient = await this.userService.createPatient({ ...createPatientDto, hospitalId });
    return { message: 'Patient created successfully', patient };
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const loginResponse = await this.userService.login(loginDto);
    return loginResponse;
  }
  @Post('verify-otp')
async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
  const { email, otp } = verifyOtpDto;
  return this.userService.verifyOtp(email, otp);
}
@UseGuards(AuthGuard('jwt'))
@Put('unblock')
async unblockUser(
  @Req() req,
  @Body('type') type: string,
  @Body('value') value: string
) {
  return this.userService.unblockUserByField(type, value, req.user);
}
@Post('join-user')
@UsePipes(new ValidationPipe({ whitelist: true }))
async createUserFromPatient(
  @Body() createUserDto: CreateUserFromPatientDto, // should have email, password, dob
  @Headers('authorization') authorization: string,
  @Headers('hospitalid') hospitalId: string,
) {
  if (!authorization) {
    throw new BadRequestException('Authorization header missing');
  }
  if (!hospitalId) {
    throw new BadRequestException('Missing hospitalId in headers');
  }

  const token = authorization.replace('Bearer ', '');

  return await this.userService.createUserFromPatient(
    token,
    createUserDto,
    hospitalId,
  );
}

/*@UseGuards(AuthGuard('jwt'))
@Get('view-patients')
async viewHospitalPatients(@Req() req) {
  const doctor = req.user; 
  if (doctor.userType !== 'doctor') {
    throw new ForbiddenException('Only doctors can view this data');
  }
  return this.userService.getHospitalWithPatients(doctor.hospitalId);
}*/

@UseGuards(AuthGuard('jwt'))
@Get('view-patients')
async viewHospitalPatients(@Req() req) {
  const currentUser = req.user;

  if (currentUser.userType === 'doctor') {
    return this.userService.getHospitalWithPatients(currentUser.hospitalId);
  }

  // Handle unauthorized access for patients or others
  const attemptsKey = `unauthorized-access:${currentUser.email}`;
  const attempts = await this.userService.handleUnauthorizedAccess(attemptsKey, currentUser.email);

  if (attempts === 'blocked') {
    throw new ForbiddenException('Your account has been blocked due to repeated unauthorized access.');
  }

  throw new ForbiddenException('Unauthorized access');
}



 @UseGuards(AuthGuard('jwt'))
  @Delete('delete/:id')
  async deletePatient(@Param('id') id: string, @Req() req) {
    if (req.user.userType !== 'doctor') {
      throw new ForbiddenException('Only doctors can delete patient records');
    }
    return this.userService.deleteOneName(id);
  }
  
  @UseGuards(AuthGuard('jwt'))
  @Put('update/:id')
  async updatePatient(@Param('id') id: string, @Body() data: any, @Req() req) {
    if (req.user.userType !== 'doctor') {
      throw new ForbiddenException('Only doctors can update patient records');
    }
    return this.userService.updatePatient(id, data);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('search')
  async searchPatients(
    @Req() req,
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('dob') dob?: string,
  ) {
    if (req.user.userType !== 'doctor') {
      throw new ForbiddenException('Only doctors can search patient records');
    }

    return this.userService.searchPatients(name, email, dob);
  }

@UseGuards(AuthGuard('jwt'))
@Get('hospital-info/:hospitalId')
async getHospitalWithPatients(@Param('hospitalId') hospitalId: string, @Req() req) {
  console.log('JWT decoded here :',req.user);
  if (req.user.userType !== 'doctor') {
    throw new ForbiddenException('Only doctors can access hospital info and patients');
  }

  return this.userService.getHospitalWithPatients(hospitalId);
}

  @Get()
    async getNames(): Promise<User[]>{
      return this.userService.getNames();
    }
  @UseGuards(AuthGuard('jwt'))
@Get(':id')
async getOneName(@Param('id') id: string, @Req() req) {
  const doctorHospitalId = req.user.hospitalId;
  const userType = req.user.userType;

  if (userType !== 'doctor') {
    throw new ForbiddenException('Only doctors can view patient records');
  }

  return this.userService.getOneName(id, doctorHospitalId);
}

}
    
