import {
  IsString,
  IsNotEmpty,
  Matches,
  Validate,
} from 'class-validator';
import { CustomValidator } from '../custom.validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ description: 'Name of the user making the booking' })
  @IsString()
  @IsNotEmpty()
  user: string;

  @ApiProperty({ description: 'Date of the booking in YYYY-MM-DD format' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in the format YYYY-MM-DD',
  })
  date: string; 

  @ApiProperty({ description: 'Start time of the booking in HH:mm format' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}:\d{2}$/, {
    message: 'StartTime must be in the format HH:mm',
  })
  startTime: string;

  @ApiProperty({ description: 'End time of the booking in HH:mm format' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}:\d{2}$/, {
    message: 'EndTime must be in the format HH:mm',
  })
  endTime: string;

  @Validate(CustomValidator)
  timeSlotValidation: boolean;
}
