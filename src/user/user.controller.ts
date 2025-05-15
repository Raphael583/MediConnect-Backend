import { Controller, Post, Put, Delete, Param, Get, Body, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { CreatePatientDto } from './dto/create-patient.dto';
import { LoginDto } from './dto/login.dto';
import { User } from './interfaces/user.interface';
import { AuthGuard } from '@nestjs/passport';



@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  
  @Post('create-doctor')
  async createDoctor(@Body() createDoctorDto: CreateDoctorDto) {
    const doctor = await this.userService.createDoctor(createDoctorDto);
    return { message: 'Doctor created successfully', doctor };
  }

  
  @Post('create-patient')
  async createPatient(@Body() createPatientDto: CreatePatientDto) {
    const patient = await this.userService.createPatient(createPatientDto);
    return { message: 'Patient created successfully', patient };
  }

  
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const loginResponse = await this.userService.login(loginDto);
    return loginResponse;
  }
 
  @UseGuards(AuthGuard('jwt'))
    @Get('view-patients')
        async getPatients(@Req() req) {
          const user = req.user; 
          if (user.userType !== 'doctor') {
             throw new ForbiddenException('Only doctors can view patient details');
         }
          return this.userService.getPatientsOnly(); 
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

  @Get()
    async getNames(): Promise<User[]>{
      return this.userService.getNames();
    }
  @Get(':id')
    async getOneName(@Param('id')id:string): Promise<User | null>{
      return this.userService.getOneName(id);
  }
}
    
