import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsStrongPassword,
  IsBoolean,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'name cannot be empty.' })
  name: string;
  @IsEmail({}, { message: 'Email cannot be empty' })
  email: string;
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minSymbols: 1,
      minNumbers: 1,
    },
    { message: 'Please follow the proper password format.' },
  )
  @IsNotEmpty()
  password: string;
  @IsBoolean()
  @IsNotEmpty()
  guest: boolean;
}
