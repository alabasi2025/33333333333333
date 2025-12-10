import { IsString, IsNumber, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { TransactionType } from '../cash-transaction.entity';

export class CreateCashTransactionDto {
  @IsNumber()
  cashBoxId: number;

  @IsEnum(TransactionType)
  transactionType: TransactionType;

  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  referenceNumber?: string;

  @IsString()
  @IsOptional()
  referenceType?: string;

  @IsNumber()
  @IsOptional()
  referenceId?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  transactionDate: string;

  @IsString()
  @IsOptional()
  createdBy?: string;
}
