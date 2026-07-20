import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const TIME_MSG = { message: 'time must be in HH:mm format (e.g. 09:00, 23:59)' };

export class BookingDto {
  @IsUUID()
  locationId: string;

  @IsUUID()
  vehicleId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  toDate: string;

  @IsOptional()
  @IsString()
  guestName?: string;

  @IsOptional()
  @IsEmail()
  guestEmail?: string;

  @IsString()
  @Matches(TIME_REGEX, TIME_MSG)
  start_time: string;

  @IsString()
  @Matches(TIME_REGEX, TIME_MSG)
  end_time: string;

  @IsOptional()
  @IsUUID()
  drop_location_id: string;

  @IsString()
  lock_key: string;
}
