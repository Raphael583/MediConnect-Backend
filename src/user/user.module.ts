import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserSchema } from './schemas/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtStrategy } from './auth/jwt.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports:[
  MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  PassportModule.register({ defaultStrategy: 'jwt' }),
  JwtModule.register({
      secret: 'object583',
      signOptions: { expiresIn: '1h' },
    }),
  ],

  controllers: [UserController],
  providers: [UserService, JwtStrategy]
})
export class UserModule {}
