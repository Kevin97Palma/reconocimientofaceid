import { Module } from '@nestjs/common';
import { ImagenvalService } from './imagenval.service';
import { ImagenvalController } from './imagenval.controller';
import { TokenidService } from '../tokenid/tokenid.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: 'Palma123', // 🔹 misma clave que en TokenidService
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [ImagenvalController],
  providers: [ImagenvalService, TokenidService],
})
export class ImagenvalModule {}