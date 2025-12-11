import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentVoucher } from './payment-voucher.entity';
import { PaymentVouchersController } from './payment-vouchers.controller';
import { PaymentVouchersService } from './payment-vouchers.service';
import { JournalEntry } from '../journal-entries/journal-entry.entity';
import { JournalEntryLine } from '../journal-entries/journal-entry-line.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentVoucher, JournalEntry, JournalEntryLine])
  ],
  controllers: [PaymentVouchersController],
  providers: [PaymentVouchersService],
  exports: [PaymentVouchersService]
})
export class PaymentVouchersModule {}
