import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ReceiptVouchersService } from './receipt-vouchers.service';
import { CreateReceiptVoucherDto, UpdateReceiptVoucherDto, ApproveReceiptVoucherDto } from './dto/create-receipt-voucher.dto';

@Controller('receipt-vouchers')
export class ReceiptVouchersController {
  constructor(private readonly receiptVouchersService: ReceiptVouchersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateReceiptVoucherDto) {
    return await this.receiptVouchersService.create(createDto);
  }

  @Get()
  async findAll(@Query() filters: any) {
    return await this.receiptVouchersService.findAll(filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.receiptVouchersService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() updateDto: UpdateReceiptVoucherDto) {
    return await this.receiptVouchersService.update(id, updateDto);
  }

  @Post(':id/approve')
  async approve(@Param('id') id: number, @Body() approveDto: ApproveReceiptVoucherDto) {
    return await this.receiptVouchersService.approve(id, approveDto);
  }

  @Post(':id/post')
  async post(@Param('id') id: number) {
    return await this.receiptVouchersService.post(id);
  }

  @Post(':id/cancel')
  async cancel(@Param('id') id: number) {
    return await this.receiptVouchersService.cancel(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: number) {
    await this.receiptVouchersService.delete(id);
  }
}
