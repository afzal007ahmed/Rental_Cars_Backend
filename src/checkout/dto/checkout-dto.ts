import { IsDateString, IsOptional, IsString, Matches } from 'class-validator';

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const TIME_MSG = { message: 'time must be in HH:mm format (e.g. 09:00, 23:59)' };

export class CheckoutDto {
  @IsDateString()
  start_date: string;

  @IsDateString()
  to_date: string;

  @IsString()
  @Matches(TIME_REGEX, TIME_MSG)
  start_time: string;

  @IsString()
  @Matches(TIME_REGEX, TIME_MSG)
  end_time: string;

  @IsOptional()
  @IsString()
  lock_key: string;
}
