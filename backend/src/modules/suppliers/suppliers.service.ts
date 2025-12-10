import { Injectable } from '@nestjs/common';
import { CreateSupplierDto, UpdateSupplierDto, SupplierDto } from '../../shared/dtos/supplier.dto';

@Injectable()
export class SuppliersService {
  private suppliers: SupplierDto[] = [
    {
      id: 1,
      name: 'مورد تجريبي',
      email: 'test@supplier.com',
      phone: '0501234567',
      address: 'الرياض',
      taxNumber: '123456789',
      contactPerson: 'أحمد محمد',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  private nextId = 2;

  findAll(): SupplierDto[] {
    return this.suppliers;
  }

  findOne(id: number): SupplierDto | undefined {
    return this.suppliers.find(s => s.id === id);
  }

  create(dto: CreateSupplierDto): SupplierDto {
    const supplier: SupplierDto = {
      id: this.nextId++,
      ...dto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.suppliers.push(supplier);
    return supplier;
  }

  update(id: number, dto: UpdateSupplierDto): SupplierDto | undefined {
    const index = this.suppliers.findIndex(s => s.id === id);
    if (index === -1) return undefined;
    
    this.suppliers[index] = {
      ...this.suppliers[index],
      ...dto,
      updatedAt: new Date(),
    };
    return this.suppliers[index];
  }

  delete(id: number): boolean {
    const index = this.suppliers.findIndex(s => s.id === id);
    if (index === -1) return false;
    
    this.suppliers.splice(index, 1);
    return true;
  }
}
