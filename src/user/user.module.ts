import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserSchema } from './schemas/user.schema';
import { HospitalSchema } from 'src/collection/hospital.schema';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtStrategy } from './auth/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { redisProvider } from 'src/redis.provider';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // ✅ Must be present to use .env
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'hospital', schema: HospitalSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'object583',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    JwtStrategy,
    redisProvider, // ✅ Provides REDIS_CLIENT
  ],
  exports: [UserService],
})
export class UserModule {}
