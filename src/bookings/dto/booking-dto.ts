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

  @IsString()
  startDate: string;

  @IsString()
  toDate: string;

  @IsOptional()
  @IsString()
  guestName?: string;

  @IsOptional()
  @IsEmail()
  guestEmail?: string;
}