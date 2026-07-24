import {
  IsDateString,
  IsOptional,
  IsString,
  IsEmail,
  Matches,
} from 'class-validator';
import { IsValidCalendarDate } from 'src/utils/dateValidator';

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const TIME_MSG = {
  message: 'time must be in HH:mm format (e.g. 09:00, 23:59)',
};

export class BookingUpdateDto {
  @IsDateString()
  @IsValidCalendarDate()
  @IsOptional()
  start_date: string;

  @IsDateString()
  @IsValidCalendarDate()
  @IsOptional()
  end_date: string;

  @IsOptional()
  @IsString()
  guest_name: string;

  @IsOptional()
  @IsEmail()
  guest_email: string;

  @IsString()
  @Matches(TIME_REGEX, TIME_MSG)
  @IsOptional()
  start_time: string;

  @IsString()
  @Matches(TIME_REGEX, TIME_MSG)
  @IsOptional()
  end_time: string;
}
