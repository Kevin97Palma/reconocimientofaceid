import { Module } from '@nestjs/common';
import { ImagenvalService } from './imagenval.service';
import { ImagenvalController } from './imagenval.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: 'SECRET_KEY', // la misma clave usada en TokenidService
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [ImagenvalController],
  providers: [ImagenvalService],
})
export class ImagenvalModule {}
