import { Body, Controller, Get, Post } from '@nestjs/common';
import { HospitalService } from './hospital.service';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { create } from 'domain';
import { HospitalDTO } from './dto/hospital.dto';
import { Hospital } from './interface/hospital.interface';

@Controller('hospital')
export class HospitalController {
    constructor(private readonly hospitalService:HospitalService){}
    @Get()
    async getName(): Promise<Hospital[]>{
        return this.hospitalService.getNames();
    }

    @Post()
      async createHospital(@Body() data: HospitalDTO):Promise<Hospital>{
        return await this.hospitalService.createHospital(data);

        }
    
}


