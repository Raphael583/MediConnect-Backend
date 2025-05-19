import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HospitalModule } from './hospital/hospital.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { SlotModule } from './slot/slot.module';



@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost/hospital-db'), HospitalModule, UserModule, SlotModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
