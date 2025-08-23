import { Module } from '@nestjs/common';
import { TokenidService } from './tokenid.service';
import { TokenidController } from './tokenid.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: 'Palma123',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [TokenidService],
  controllers: [TokenidController],
  exports: [TokenidService],
})
export class TokenidModule {}