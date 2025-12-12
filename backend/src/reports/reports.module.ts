import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { PdfGeneratorService } from './pdf-generator.service';
import { JournalEntry } from '../journal-entries/journal-entry.entity';
import { JournalEntryLine } from '../journal-entries/journal-entry-line.entity';
import { Account } from '../accounts/account.entity';
import { StockBalance } from '../warehouses/stock-balance.entity';
import { StockMovement } from '../warehouses/stock-movement.entity';
import { Warehouse } from '../warehouses/warehouse.entity';
import { Item } from '../warehouses/item.entity';
import { InventoryReportsService } from './inventory-reports.service';
import { InventoryReportsController } from './inventory-reports.controller';

@Module({
  imports: [TypeOrmModule.forFeature([JournalEntry, JournalEntryLine, Account, StockBalance, StockMovement, Warehouse, Item])],
  controllers: [ReportsController, InventoryReportsController],
  providers: [ReportsService, PdfGeneratorService, InventoryReportsService],
  exports: [ReportsService, InventoryReportsService],
})
export class ReportsModule {}
