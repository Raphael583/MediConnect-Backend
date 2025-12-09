import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PatientSchema } from './schema/patient.schema';
import { PatientController } from './patients.controller';
import { PatientsService } from './patients.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from 'src/redis.module';


@Module({
  imports:[
    MongooseModule.forFeature([{name:'Patient', schema:PatientSchema}]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '1h' },
        }),
        RedisModule,
  ],
  controllers: [PatientController],
  providers: [PatientsService],
  exports: [PatientsService],
})
export class PatientsModule {}

