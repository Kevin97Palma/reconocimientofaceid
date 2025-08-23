import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TokenidModule } from './tokenid/tokenid.module';
import { ImagenvalModule } from './imagenval/imagenval.module';

@Module({
  imports: [TokenidModule, ImagenvalModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
