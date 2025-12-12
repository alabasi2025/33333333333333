import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecurringTransactionsController } from './recurring-transactions.controller';
import { RecurringTransactionsService } from './recurring-transactions.service';
import { RecurringTransaction } from './recurring-transaction.entity';
import { JournalEntriesModule } from '../journal-entries/journal-entries.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RecurringTransaction]),
    JournalEntriesModule
  ],
  controllers: [RecurringTransactionsController],
  providers: [RecurringTransactionsService],
  exports: [RecurringTransactionsService]
})
export class RecurringTransactionsModule {}
