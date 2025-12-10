import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashBoxesController } from './cash-boxes.controller';
import { CashBoxesService } from './cash-boxes.service';
import { CashBox } from './cash-box.entity';
import { CashTransaction } from './cash-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CashBox, CashTransaction])],
  controllers: [CashBoxesController],
  providers: [CashBoxesService],
  exports: [CashBoxesService]
})
export class CashBoxesModule {}
