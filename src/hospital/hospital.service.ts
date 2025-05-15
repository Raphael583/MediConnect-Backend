import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model} from 'mongoose';
import { Hospital } from './interface/hospital.interface';
import { HospitalDTO } from './dto/hospital.dto';



@Injectable()
export class HospitalService {
  constructor(@InjectModel('Patient_rec') private hospitalModel: Model<Hospital>) {}


    async getNames (): Promise <Hospital[]> {
        return await this.hospitalModel.find().exec();
    }

    async createHospital(data:HospitalDTO): Promise <Hospital>{
        const h=new this.hospitalModel(data);
        return await h.save();
    }
}
