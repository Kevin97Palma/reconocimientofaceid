import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TokenidModule } from './tokenid/tokenid.module';

@Module({
  imports: [TokenidModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
