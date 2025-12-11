import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentVouchersService } from './payment-vouchers.service';
import { CreatePaymentVoucherDto, UpdatePaymentVoucherDto, ApprovePaymentVoucherDto } from './dto/create-payment-voucher.dto';

@Controller('payment-vouchers')
export class PaymentVouchersController {
  constructor(private readonly paymentVouchersService: PaymentVouchersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreatePaymentVoucherDto) {
    return await this.paymentVouchersService.create(createDto);
  }

  @Get()
  async findAll(@Query() filters: any) {
    return await this.paymentVouchersService.findAll(filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.paymentVouchersService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() updateDto: UpdatePaymentVoucherDto) {
    return await this.paymentVouchersService.update(id, updateDto);
  }

  @Post(':id/approve')
  async approve(@Param('id') id: number, @Body() approveDto: ApprovePaymentVoucherDto) {
    return await this.paymentVouchersService.approve(id, approveDto);
  }

  @Post(':id/post')
  async post(@Param('id') id: number) {
    return await this.paymentVouchersService.post(id);
  }

  @Post(':id/cancel')
  async cancel(@Param('id') id: number) {
    return await this.paymentVouchersService.cancel(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: number) {
    await this.paymentVouchersService.delete(id);
  }
}
