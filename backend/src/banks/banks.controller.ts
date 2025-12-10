import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { BanksService } from './banks.service';
import { Bank } from './bank.entity';

@Controller('banks')
export class BanksController {
  constructor(private readonly banksService: BanksService) {}

  @Get()
  async findAll(): Promise<Bank[]> {
    return await this.banksService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Bank> {
    return await this.banksService.findOne(id);
  }

  @Post()
  async create(@Body() bankData: Partial<Bank>): Promise<Bank> {
    return await this.banksService.create(bankData);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() bankData: Partial<Bank>,
  ): Promise<Bank> {
    return await this.banksService.update(id, bankData);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
    await this.banksService.remove(id);
    return { success: true };
  }

  @Put(':id/toggle-status')
  async toggleStatus(@Param('id', ParseIntPipe) id: number): Promise<Bank> {
    return await this.banksService.toggleStatus(id);
  }
}
