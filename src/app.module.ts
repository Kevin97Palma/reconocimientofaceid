import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TokenidModule } from './tokenid/tokenid.module';
import { ImagenvalModule } from './imagenval/imagenval.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [TokenidModule, ImagenvalModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
