import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Warehouse } from './warehouse.entity';
import { Item } from './item.entity';
import { StockMovement } from './stock-movement.entity';
import { StockBalance } from './stock-balance.entity';
import { WarehousesController } from './warehouses.controller';
import { WarehousesService } from './warehouses.service';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { StockMovementsController } from './stock-movements.controller';
import { StockMovementsService } from './stock-movements.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Warehouse, Item, StockMovement, StockBalance]),
  ],
  controllers: [WarehousesController, ItemsController, StockMovementsController],
  providers: [WarehousesService, ItemsService, StockMovementsService],
  exports: [WarehousesService, ItemsService, StockMovementsService],
})
export class WarehousesModule {}
