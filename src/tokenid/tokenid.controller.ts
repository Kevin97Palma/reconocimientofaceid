import { Controller, Post, Body } from '@nestjs/common';
import { TokenidService } from './tokenid.service';
import { CreateTokenidDto } from './dto/create-tokenid.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('tokenid')
@Controller('tokenid')
export class TokenidController {
  constructor(private readonly tokenService: TokenidService) {}

  @Post('login')
  @ApiOperation({ summary: 'Generar token JWT con usuario y clave' })
  @ApiResponse({ status: 201, description: 'Token generado correctamente.' })
  @ApiResponse({ status: 401, description: 'Usuario o contraseña incorrectos.' })
  login(@Body() createTokenidDto: CreateTokenidDto) {
    const { username, password } = createTokenidDto;
    this.tokenService.validateUser(username, password);
    const token = this.tokenService.generateToken(username);
    return { token };
  }
}
