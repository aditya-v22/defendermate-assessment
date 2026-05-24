import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'analyst' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'DefenderM8!' })
  @IsString()
  password: string;
}
