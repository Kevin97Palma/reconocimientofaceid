import { Controller, Post, Body } from '@nestjs/common';
import { TokenidService } from './tokenid.service';
import { CreateTokenidDto } from './dto/create-tokenid.dto';

@Controller('tokenid')
export class TokenidController {
  constructor(private readonly tokenService: TokenidService) {}

  @Post('login')
  login(@Body() createTokenidDto: CreateTokenidDto) {
    const { username, password } = createTokenidDto;
    this.tokenService.validateUser(username, password);
    const token = this.tokenService.generateToken(username);
    return { token };
  }
}
