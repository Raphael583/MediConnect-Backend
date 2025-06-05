import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HospitalModule } from './hospital/hospital.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { SlotModule } from './slot/slot.module';
import { redisProvider } from './redis.provider';
import { PatientsModule } from './patients/patients.module';
import { RedisModule } from './redis.module';
import { RazorpayService } from './razorpay/razorpay.service';
import { RazorpayController } from './razorpay/razorpay.controller';
import { RazorpayModule } from './razorpay/razorpay.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot('mongodb://localhost/hospital-db'),
    HospitalModule,
    UserModule,
    SlotModule,
    PatientsModule,
    RedisModule,
    RazorpayModule,
  ],
  controllers: [AppController, RazorpayController],
  providers: [AppService, redisProvider, RazorpayService],
})
export class AppModule {}
