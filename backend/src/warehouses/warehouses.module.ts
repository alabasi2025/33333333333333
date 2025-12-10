import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Warehouse } from './warehouse.entity';
import { Item } from './item.entity';
import { StockMovement } from './stock-movement.entity';
import { StockBalance } from './stock-balance.entity';
import { WarehouseGroup } from './warehouse-group.entity';
import { StockTransaction } from './stock-transaction.entity';
import { StockTransactionItem } from './stock-transaction-item.entity';
import { JournalEntry } from '../journal-entries/journal-entry.entity';
import { JournalEntryLine } from '../journal-entries/journal-entry-line.entity';
import { WarehouseGroupsController } from './warehouse-groups.controller';
import { WarehouseGroupsService } from './warehouse-groups.service';
import { StockTransactionsController } from './stock-transactions.controller';
import { StockTransactionsService } from './stock-transactions.service';
import { WarehousesController } from './warehouses.controller';
import { WarehousesService } from './warehouses.service';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { StockMovementsController } from './stock-movements.controller';
import { StockMovementsService } from './stock-movements.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Warehouse, Item, StockMovement, StockBalance, WarehouseGroup, StockTransaction, StockTransactionItem, JournalEntry, JournalEntryLine]),
  ],
  controllers: [WarehousesController, ItemsController, StockMovementsController, WarehouseGroupsController, StockTransactionsController],
  providers: [WarehousesService, ItemsService, StockMovementsService, WarehouseGroupsService, StockTransactionsService],
  exports: [WarehousesService, ItemsService, StockMovementsService, WarehouseGroupsService, StockTransactionsService],
})
export class WarehousesModule {}
