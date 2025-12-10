import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { StockMovementsService } from './stock-movements.service';
import { StockMovement } from './stock-movement.entity';
import { StockBalance } from './stock-balance.entity';

@Controller('stock-movements')
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Get()
  async findAll(
    @Query('warehouseId') warehouseId?: string,
    @Query('itemId') itemId?: string,
  ): Promise<StockMovement[]> {
    return await this.stockMovementsService.findAll(
      warehouseId ? +warehouseId : undefined,
      itemId ? +itemId : undefined,
    );
  }

  @Get('balances')
  async getStockBalances(
    @Query('warehouseId') warehouseId?: string,
    @Query('itemId') itemId?: string,
  ): Promise<StockBalance[]> {
    return await this.stockMovementsService.getStockBalances(
      warehouseId ? +warehouseId : undefined,
      itemId ? +itemId : undefined,
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<StockMovement> {
    return await this.stockMovementsService.findOne(id);
  }

  @Post()
  async create(@Body() movementData: Partial<StockMovement>): Promise<StockMovement> {
    return await this.stockMovementsService.create(movementData);
  }
}
