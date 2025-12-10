import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { CashBoxesService } from './cash-boxes.service';
import { CreateCashBoxDto } from './dto/create-cash-box.dto';
import { UpdateCashBoxDto } from './dto/update-cash-box.dto';
import { CreateCashTransactionDto } from './dto/create-cash-transaction.dto';

@Controller('cash-boxes')
export class CashBoxesController {
  constructor(private readonly cashBoxesService: CashBoxesService) {}

  @Get()
  findAll(@Query('unitId') unitId?: string) {
    return this.cashBoxesService.findAll(unitId ? +unitId : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cashBoxesService.findOne(+id);
  }

  @Post()
  create(@Body() createDto: CreateCashBoxDto) {
    return this.cashBoxesService.create(createDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateCashBoxDto) {
    return this.cashBoxesService.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cashBoxesService.remove(+id);
  }

  @Get(':id/balance')
  getBalance(@Param('id') id: string) {
    return this.cashBoxesService.getBalance(+id);
  }

  @Get('transactions/all')
  findTransactions(
    @Query('cashBoxId') cashBoxId?: string,
    @Query('unitId') unitId?: string
  ) {
    return this.cashBoxesService.findTransactions(
      cashBoxId ? +cashBoxId : undefined,
      unitId ? +unitId : undefined
    );
  }

  @Post('transactions')
  createTransaction(@Body() createDto: CreateCashTransactionDto) {
    return this.cashBoxesService.createTransaction(createDto);
  }
}
