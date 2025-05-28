
import { IsEmail, IsNotEmpty, Matches } from 'class-validator';

export class CreateCsvPatientDto {
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @Matches(/^[6-9]\d{9}$/, {
    message: 'Mobile must be a valid 10-digit number starting with 6-9',
  })
  mobile: string;

  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsNotEmpty({ message: 'Identifier is required' })
  identifier: string;
}
