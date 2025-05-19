import { IsDate, IsEmail, IsNotEmpty,Matches, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePatientDto {
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
