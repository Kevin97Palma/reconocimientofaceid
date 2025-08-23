import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTokenidDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}