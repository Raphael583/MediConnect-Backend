import {Controller,Post,UploadedFile,UseInterceptors,HttpException,HttpStatus,Body,BadRequestException} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PatientsService } from './patients.service';
import * as csv from 'csv-parser';
import { CreateCsvPatientDto } from './dto/csv-patient.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Express } from 'express';
import { Readable } from 'stream';

@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('excel'))
  async uploadCsv(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('File not uploaded', HttpStatus.BAD_REQUEST);
    }

    const patients: CreateCsvPatientDto[] = [];
    const invalidRows: { row: any; errors: string[] }[] = [];

    const stream = Readable.from(file.buffer);
    const parser = stream.pipe(csv());

    for await (const row of parser) {
      const dto = plainToInstance(CreateCsvPatientDto, row);
      const errors = await validate(dto);

      if (errors.length === 0) {
        patients.push(dto);
      } else {
        const messages = errors
          .map(err => Object.values(err.constraints ?? {}).join(', '))
          .flat();
        invalidRows.push({ row, errors: messages });
      }
    }

    try {
      const saved = await this.patientService.csvCreate(patients);
      return {
        message: `${saved.length} patients uploaded successfully`,
        data: saved,
        invalidRows,
      };
    } catch (error) {
      throw new HttpException(
        'Error saving patients to database',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('activate/send-otp')
  async sendOtp(@Body('identifier') identifier: string) {
    if (!identifier) {
      throw new BadRequestException('Identifier is required');
    }

    return await this.patientService.sendActivationOtp(identifier);
  }

  @Post('activate/verify-otp')
  async verifyOtp(
    @Body('identifier') identifier: string,
    @Body('otp') otp: string,
  ) {
    if (!identifier || !otp) {
      throw new BadRequestException('Identifier and OTP are required');
    }

    return await this.patientService.verifyActivationOtp(identifier, otp);
  }
}
