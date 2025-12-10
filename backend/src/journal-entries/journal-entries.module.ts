import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JournalEntry } from './journal-entry.entity';
import { JournalEntryLine } from './journal-entry-line.entity';
import { JournalEntriesService } from './journal-entries.service';
import { JournalEntriesController } from './journal-entries.controller';

@Module({
  imports: [TypeOrmModule.forFeature([JournalEntry, JournalEntryLine])],
  controllers: [JournalEntriesController],
  providers: [JournalEntriesService],
  exports: [JournalEntriesService],
})
export class JournalEntriesModule {}
