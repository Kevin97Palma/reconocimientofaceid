import { PartialType } from '@nestjs/mapped-types';
import { CreateTokenidDto } from './create-tokenid.dto';

export class UpdateTokenidDto extends PartialType(CreateTokenidDto) {}
