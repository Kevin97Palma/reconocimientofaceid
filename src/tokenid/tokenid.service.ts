import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenidService {
  constructor(private readonly jwtService: JwtService) {}

  validateUser(username: string, password: string) {
    if (username === 'admin' && password === '1234') {
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
