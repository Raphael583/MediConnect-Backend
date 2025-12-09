import { IsString, IsNotEmpty } from 'class-validator';

export class InitiateCallDto {
  @IsString()
  @IsNotEmpty()
  toNumber: string;

  @IsString()
  @IsNotEmpty()
  slotId: string;
}
