export class CreatePaymentVoucherDto {
  voucherNumber: string;
  date: Date;
  amount: number;
  accountId: number;
  beneficiaryName?: string;
  paymentMethod?: string;
  referenceNumber?: string;
  description?: string;
  createdBy?: string;
}

export class UpdatePaymentVoucherDto {
  voucherNumber?: string;
  date?: Date;
  amount?: number;
  accountId?: number;
  beneficiaryName?: string;
  paymentMethod?: string;
  referenceNumber?: string;
  description?: string;
  status?: string;
}

export class ApprovePaymentVoucherDto {
  approvedBy: string;
}
