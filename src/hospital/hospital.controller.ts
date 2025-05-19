import { Body, Controller, Get, Put,Param, Post, Delete } from '@nestjs/common';
import { HospitalService } from './hospital.service';
import { HospitalDTO } from './dto/hospital.dto';
import { Hospital } from './interface/hospital.interface';

@Controller('hospital')
export class HospitalController {
    constructor(private readonly hospitalService:HospitalService){}
    @Get()
    async getNames(): Promise<Hospital[]>{
        return this.hospitalService.getNames();
    }
    @Get(':id')
    async getOneName(@Param('id')id:string): Promise<Hospital | null>{
        return this.hospitalService.getOneName(id);
    }
    @Put(':id')
    async updateOneName(@Param('id')id:string, @Body() data: HospitalDTO ): Promise<Hospital | null>{
        return this.hospitalService.updateOneName(id,data);
    }
    @Delete(':id')
    async deleteOneName(@Param('id')id:string ): Promise<Hospital | null>{
        return this.hospitalService.deleteOneName(id);
    }

    @Post()
      async createHospital(@Body() data: HospitalDTO):Promise<Hospital>{
        return await this.hospitalService.createHospital(data);

        }
    
}


