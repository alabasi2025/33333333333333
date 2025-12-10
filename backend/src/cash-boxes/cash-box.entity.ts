import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Account } from '../accounts/account.entity';
import { CashTransaction } from './cash-transaction.entity';

@Entity('cash_boxes')
export class CashBox {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  code: string;

  @Column({ name: 'account_id', nullable: true })
  accountId: number;

  @Column({ name: 'intermediate_account_id', nullable: true })
  intermediateAccountId: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, name: 'opening_balance' })
  openingBalance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, name: 'current_balance' })
  currentBalance: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Account, { nullable: true })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @ManyToOne(() => Account, { nullable: true })
  @JoinColumn({ name: 'intermediate_account_id' })
  intermediateAccount: Account;

  @OneToMany(() => CashTransaction, transaction => transaction.cashBox)
  transactions: CashTransaction[];
}
