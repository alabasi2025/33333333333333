import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JournalEntry } from './journal-entry.entity';
import { JournalEntryLine } from './journal-entry-line.entity';
import { JournalEntriesService } from './journal-entries.service';

@Module({
  imports: [TypeOrmModule.forFeature([JournalEntry, JournalEntryLine])],
  providers: [JournalEntriesService],
  exports: [JournalEntriesService],
})
export class JournalEntriesModule {}
