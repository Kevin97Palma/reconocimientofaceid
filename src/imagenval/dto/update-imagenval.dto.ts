import { PartialType } from '@nestjs/swagger';
import { CreateImagenvalDto } from './create-imagenval.dto';

export class UpdateImagenvalDto extends PartialType(CreateImagenvalDto) {}
