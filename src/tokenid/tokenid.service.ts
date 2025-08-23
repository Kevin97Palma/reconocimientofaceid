// tokenid.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenidService {
  private readonly secretKey = 'Palma123'; // 🔹 misma clave usada en JwtModule

  constructor(private readonly jwtService: JwtService) {}

  validateUser(username: string, password: string) {
    if (username === 'admin' && password === '1234') {
      return true;
    }
    throw new UnauthorizedException('Usuario o contraseña incorrectos');
  }

  generateToken(username: string) {
    // 🔹 Usar la misma clave
    return this.jwtService.sign({ username }, { secret: this.secretKey, expiresIn: '1h' });
  }

  validateToken(token: string) {
    try {
      // 🔹 Verifica el token con la misma clave
      return this.jwtService.verify(token, { secret: this.secretKey });
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
