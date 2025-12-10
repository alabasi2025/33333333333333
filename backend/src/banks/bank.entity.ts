import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from '../accounts/account.entity';

@Entity('banks')
export class Bank {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  code: string;

  @Column({ name: 'account_id', nullable: true })
  accountId: number;

  @Column({ name: 'intermediate_account_id', nullable: true, unique: true })
  intermediateAccountId: number;

  @ManyToOne(() => Account, { nullable: true })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @ManyToOne(() => Account, { nullable: true })
  @JoinColumn({ name: 'intermediate_account_id' })
  intermediateAccount: Account;

  @Column({ name: 'account_number', nullable: true })
  accountNumber: string;

  @Column({ name: 'iban', nullable: true })
  iban: string;

  @Column({ name: 'swift_code', nullable: true })
  swiftCode: string;

  @Column({ name: 'branch_name', nullable: true })
  branchName: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'opening_balance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  openingBalance: string;

  @Column({ name: 'current_balance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  currentBalance: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
