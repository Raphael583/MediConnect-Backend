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
      async getOneName (id:string): Promise <Hospital | null> {
        return await this.hospitalModel.findById(id).exec();
    }
    async deleteOneName (id:string): Promise <Hospital|null> {
        return await this.hospitalModel.findOneAndDelete({_id:id}).exec();
    }
      async updateOneName (id:string,data:HospitalDTO): Promise <Hospital | null> {
        console.log('Updating id:',id);
        console.log('Updated text',data);
        return await this.hospitalModel.findOneAndUpdate({_id:id},data,{new:true}).exec();
    }

    async createHospital(data:HospitalDTO): Promise <Hospital>{
        const h=new this.hospitalModel(data);
        return await h.save();
    }
}
