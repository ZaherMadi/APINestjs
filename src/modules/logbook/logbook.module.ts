import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogbookService } from './logbook.service';
import { LogbookController } from './logbook.controller';
import { LogbookEntry } from './entities/logbook-entry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LogbookEntry])],
  controllers: [LogbookController],
  providers: [LogbookService],
  exports: [LogbookService],
})
export class LogbookModule {}
