export class CreateSupplierDto {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxNumber?: string;
  contactPerson?: string;
}

export class UpdateSupplierDto {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxNumber?: string;
  contactPerson?: string;
}

export class SupplierDto {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxNumber?: string;
  contactPerson?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
