import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReceiptVoucher } from './receipt-voucher.entity';
import { ReceiptVouchersController } from './receipt-vouchers.controller';
import { ReceiptVouchersService } from './receipt-vouchers.service';
import { JournalEntry } from '../journal-entries/journal-entry.entity';
import { JournalEntryLine } from '../journal-entries/journal-entry-line.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReceiptVoucher, JournalEntry, JournalEntryLine])
  ],
  controllers: [ReceiptVouchersController],
  providers: [ReceiptVouchersService],
  exports: [ReceiptVouchersService]
})
export class ReceiptVouchersModule {}
