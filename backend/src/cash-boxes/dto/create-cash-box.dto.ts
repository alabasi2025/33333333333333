import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateCashBoxDto {
  @IsNumber()
  unitId: number;

  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsNumber()
  @IsOptional()
  accountId?: number;

  @IsNumber()
  @IsOptional()
  intermediateAccountId?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  openingBalance?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
