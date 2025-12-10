import { Controller, Get, Post, Delete, Body, Param, Query, Patch } from '@nestjs/common';
import { StockTransactionsService } from './stock-transactions.service';
import { CreateStockTransactionDto } from './dto/create-stock-transaction.dto';

@Controller('stock-transactions')
export class StockTransactionsController {
  constructor(private readonly stockTransactionsService: StockTransactionsService) {}

  @Get()
  findAll(@Query('type') type?: 'in' | 'out') {
    return this.stockTransactionsService.findAll(type);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockTransactionsService.findOne(+id);
  }

  @Post()
  create(@Body() createDto: CreateStockTransactionDto) {
    return this.stockTransactionsService.create(createDto);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string, @Body('approvedBy') approvedBy: string) {
    return this.stockTransactionsService.approve(+id, approvedBy);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.stockTransactionsService.delete(+id);
  }
}
