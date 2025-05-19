import { IsDate, IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDoctorDto {
  @IsEmail()
  @Matches(/^[^A-Z]+$/, { message: 'Email must be in lowercase format' })
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsDate()
  @Type(()=>Date)
  dob: Date;

  hospitalId: string; 
}
