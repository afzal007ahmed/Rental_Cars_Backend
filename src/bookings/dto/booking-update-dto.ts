import { IsOptional, IsString, IsUUID, IsEmail } from 'class-validator';

export class BookingUpdateDto {

  @IsString()
  @IsOptional()
  start_date: string;

  @IsString()
  @IsOptional()
  end_date: string;

  @IsOptional()
  @IsString()
  guest_name: string;

  @IsOptional()
  @IsEmail()
  guest_email: string;

  @IsString()
  @IsOptional()
  start_time: string;

  @IsString()
  @IsOptional()
  end_time: string;
}
