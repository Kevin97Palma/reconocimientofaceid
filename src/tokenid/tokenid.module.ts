import { Module } from '@nestjs/common';
import { TokenidService } from './tokenid.service';
import { TokenidController } from './tokenid.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('COMPAREFACE_SECRET_KEY'),
        signOptions: { expiresIn: '6mo' },
      }),
    }),
  ],
  providers: [TokenidService],
  controllers: [TokenidController],
  exports: [TokenidService],
})
export class TokenidModule {}
