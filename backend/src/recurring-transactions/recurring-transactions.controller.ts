import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { RecurringTransactionsService } from './recurring-transactions.service';
import { RecurringTransaction } from './recurring-transaction.entity';

@Controller('recurring-transactions')
export class RecurringTransactionsController {
  constructor(private readonly recurringTransactionsService: RecurringTransactionsService) {}

  @Post()
  async create(@Body() data: Partial<RecurringTransaction>) {
    return await this.recurringTransactionsService.create(data);
  }

  @Get()
  async findAll() {
    return await this.recurringTransactionsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.recurringTransactionsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<RecurringTransaction>
  ) {
    return await this.recurringTransactionsService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.recurringTransactionsService.remove(id);
    return { success: true };
  }

  @Post(':id/execute')
  async execute(@Param('id', ParseIntPipe) id: number) {
    return await this.recurringTransactionsService.execute(id);
  }
}
