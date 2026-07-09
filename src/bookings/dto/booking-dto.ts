import { 
  IsDateString, 
  IsEmail, 
  IsOptional, 
  IsString, 
  IsUUID 
} from 'class-validator';

export class BookingDto {
  @IsUUID()
  locationId: string;

  @IsUUID()
  vehicleId: string;

  @IsDateString()
  startDate: Date;

  @IsDateString()
  toDate: Date;

  @IsOptional()
  @IsString()
  guestName?: string;

  @IsOptional()
  @IsEmail()
  guestEmail?: string;
}