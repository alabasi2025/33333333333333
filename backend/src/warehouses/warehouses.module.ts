import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Warehouse } from './warehouse.entity';
import { Item } from './item.entity';
import { StockMovement } from './stock-movement.entity';
import { StockBalance } from './stock-balance.entity';
import { WarehouseGroup } from './warehouse-group.entity';
import { WarehouseGroupsController } from './warehouse-groups.controller';
import { WarehouseGroupsService } from './warehouse-groups.service';
import { WarehousesController } from './warehouses.controller';
import { WarehousesService } from './warehouses.service';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { StockMovementsController } from './stock-movements.controller';
import { StockMovementsService } from './stock-movements.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Warehouse, Item, StockMovement, StockBalance, WarehouseGroup]),
  ],
  controllers: [WarehousesController, ItemsController, StockMovementsController, WarehouseGroupsController],
  providers: [WarehousesService, ItemsService, StockMovementsService, WarehouseGroupsService],
  exports: [WarehousesService, ItemsService, StockMovementsService, WarehouseGroupsService],
})
export class WarehousesModule {}
