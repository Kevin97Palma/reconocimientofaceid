import { Module } from '@nestjs/common';
import { ImagenvalService } from './imagenval.service';
import { ImagenvalController } from './imagenval.controller';
import { TokenidService } from '../tokenid/tokenid.service';
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
  controllers: [ImagenvalController],
  providers: [ImagenvalService, TokenidService],
  exports: [TokenidService],
})
export class ImagenvalModule {}