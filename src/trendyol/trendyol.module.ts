import { Module } from '@nestjs/common';
import { TrendyolService } from './trendyol.service';
import { TrendyolController } from './trendyol.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [TrendyolController],
  providers: [TrendyolService],
})
export class TrendyolModule {}
