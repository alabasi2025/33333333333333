import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CashBox } from '../cash-boxes/cash-box.entity';
import { Bank } from '../banks/bank.entity';
import { Account } from '../accounts/account.entity';

export enum VoucherType {
  PAYMENT = 'payment',  // سند صرف
  RECEIPT = 'receipt',  // سند قبض
}

export enum PaymentMethod {
  CASH = 'cash',   // نقدي (صندوق)
  BANK = 'bank',   // بنكي
}

@Entity('vouchers')
export class Voucher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'voucher_number' })
  voucherNumber: string;

  @Column({
    type: 'enum',
    enum: VoucherType,
  })
  type: VoucherType;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    name: 'payment_method',
  })
  paymentMethod: PaymentMethod;

  @Column({ type: 'date' })
  date: Date;

  // للصناديق
  @Column({ name: 'cash_box_id', nullable: true })
  cashBoxId: number;

  @ManyToOne(() => CashBox, { nullable: true })
  @JoinColumn({ name: 'cash_box_id' })
  cashBox: CashBox;

  // للبنوك
  @Column({ name: 'bank_id', nullable: true })
  bankId: number;

  @ManyToOne(() => Bank, { nullable: true })
  @JoinColumn({ name: 'bank_id' })
  bank: Bank;

  // الحساب المرتبط (المدين في الصرف / الدائن في القبض)
  @Column({ name: 'account_id' })
  accountId: number;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: string;

  @Column({ nullable: true })
  beneficiary: string;  // المستفيد (في الصرف) / المستلم من (في القبض)

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
