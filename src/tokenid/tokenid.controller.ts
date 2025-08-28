import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { TokenidService } from './tokenid.service';
import { CreateTokenidDto } from './dto/create-tokenid.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('tokenid')
@Controller('tokenid')
export class TokenidController {
  constructor(private readonly tokenService: TokenidService) {}

  @Post('create')
  @ApiOperation({ summary: 'Generar token JWT a partir de usuario y contraseña' })
  @ApiResponse({ status: 201, description: 'Token generado exitosamente' })
  @ApiResponse({ status: 401, description: 'Usuario o contraseña incorrectos' })
  async createToken(@Body() dto: CreateTokenidDto) {
    console.table(dto);
    
    const { username, password } = dto;

    // Validar usuario y contraseña
    const valid = this.tokenService.validateUser(username, password);
    if (!valid) throw new UnauthorizedException('Usuario o contraseña incorrectos');

    // Generar token usando el secreto configurado en JwtModule
    const token = this.tokenService.generateToken(username);

    return { token };
  }
}