import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('recurring_transactions')
export class RecurringTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 20 })
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';

  @Column({ type: 'date', name: 'start_date' })
  startDate: Date;

  @Column({ type: 'date', name: 'end_date', nullable: true })
  endDate: Date;

  @Column({ type: 'date', name: 'next_run_date' })
  nextRunDate: Date;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', name: 'template_data' })
  templateData: {
    description: string;
    lines: Array<{
      accountId: number;
      debit: number;
      credit: number;
      description?: string;
    }>;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
