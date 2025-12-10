export class CreateStockTransactionItemDto {
  itemId: number;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

export class CreateStockTransactionDto {
  transactionType: 'in' | 'out';
  warehouseId: number;
  transactionDate: Date;
  referenceNumber?: string;
  notes?: string;
  createdBy?: string;
  items: CreateStockTransactionItemDto[];
}
