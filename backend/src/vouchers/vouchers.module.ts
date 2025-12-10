import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Voucher } from './voucher.entity';
import { VouchersService } from './vouchers.service';
import { VouchersController } from './vouchers.controller';
import { CashBoxesModule } from '../cash-boxes/cash-boxes.module';
import { BanksModule } from '../banks/banks.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Voucher]),
    CashBoxesModule,
    BanksModule,
  ],
  controllers: [VouchersController],
  providers: [VouchersService],
  exports: [VouchersService],
})
export class VouchersModule {}
