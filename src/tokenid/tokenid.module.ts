import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TokenidService } from './tokenid.service';
import { TokenidController } from './tokenid.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: 'SECRET_KEY', // Cambiar por algo seguro
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [TokenidController],
  providers: [TokenidService],
  exports: [TokenidService],
})
export class TokenidModule {}