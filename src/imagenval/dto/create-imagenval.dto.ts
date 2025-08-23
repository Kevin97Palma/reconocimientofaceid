import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateImagenvalDto {
  @ApiProperty({ description: 'Token JWT obtenido desde login' })
  @IsString()
  @IsNotEmpty()
  token: string;
}