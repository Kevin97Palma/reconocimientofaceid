import { Module } from '@nestjs/common';
import { TokenidService } from './tokenid.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: 'Palma123', // <- aquí defines la clave secreta
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [TokenidService],
  exports: [TokenidService], // <-- exporta para otros módulos
})
export class TokenidModule {}