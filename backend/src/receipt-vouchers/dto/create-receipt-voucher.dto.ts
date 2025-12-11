export class CreateReceiptVoucherDto {
  voucherNumber: string;
  date: Date;
  amount: number;
  accountId: number;
  payerName?: string;
  paymentMethod?: string;
  referenceNumber?: string;
  description?: string;
  createdBy?: string;
}

export class UpdateReceiptVoucherDto {
  voucherNumber?: string;
  date?: Date;
  amount?: number;
  accountId?: number;
  payerName?: string;
  paymentMethod?: string;
  referenceNumber?: string;
  description?: string;
  status?: string;
}

export class ApproveReceiptVoucherDto {
  approvedBy: string;
}
