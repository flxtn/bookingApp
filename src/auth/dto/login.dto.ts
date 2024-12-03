import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'username' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ description: 'password' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
