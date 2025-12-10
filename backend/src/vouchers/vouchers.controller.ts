import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { Voucher, VoucherType, PaymentMethod } from './voucher.entity';

@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Get()
  async findAll(@Query('type') type?: VoucherType): Promise<Voucher[]> {
    return await this.vouchersService.findAll(type);
  }

  @Get('next-number')
  async getNextVoucherNumber(
    @Query('paymentMethod') paymentMethod: PaymentMethod,
    @Query('cashBoxId') cashBoxId?: string,
    @Query('bankId') bankId?: string,
  ): Promise<{ voucherNumber: string }> {
    const voucherNumber = await this.vouchersService.getNextVoucherNumber(
      paymentMethod,
      cashBoxId ? parseInt(cashBoxId) : undefined,
      bankId ? parseInt(bankId) : undefined,
    );
    return { voucherNumber };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Voucher> {
    return await this.vouchersService.findOne(id);
  }

  @Post()
  async create(@Body() voucherData: Partial<Voucher>): Promise<Voucher> {
    return await this.vouchersService.create(voucherData);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() voucherData: Partial<Voucher>,
  ): Promise<Voucher> {
    return await this.vouchersService.update(id, voucherData);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
    await this.vouchersService.remove(id);
    return { success: true };
  }
}
