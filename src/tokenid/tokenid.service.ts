import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenidService {
  
  private comparefaceAppUser: string;
  private comparefaceAppPass: string;

  constructor(private readonly jwtService: JwtService, private readonly configService: ConfigService) {
    this.comparefaceAppUser = this.configService.get<string>('COMPAREFACE_USER_API') || '';
    this.comparefaceAppPass = this.configService.get<string>('COMPAREFACE_PASS_API') || '';
  }

  validateUser(username: string, password: string) {

    if (username === this.comparefaceAppUser && password === this.comparefaceAppPass) {
      return true;
    }
    throw new UnauthorizedException('Usuario o contraseña incorrectos');
  }

  generateToken(username: string) {
    return this.jwtService.sign({ username }); // usará automáticamente el secreto de JwtModule
  }

  validateToken(token: string) {
    try {
      return this.jwtService.verify(token); // verifica usando el mismo secreto del JwtModule
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
