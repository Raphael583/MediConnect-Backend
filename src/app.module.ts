import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HospitalModule } from './hospital/hospital.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';



@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost/hospital-db'), HospitalModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
