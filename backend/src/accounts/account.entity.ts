import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column()
  name: string;

  @Column()
  type: string; // asset, liability, equity, revenue, expense

  @Column({ name: 'account_level' })
  accountLevel: string; // main, sub

  @Column({ name: 'sub_type', nullable: true })
  subType: string; // general, cash, bank, supplier, customer, warehouse

  @Column({ nullable: true })
  order: number;

  @Column({ name: 'parent_id', nullable: true })
  parentId: number;

  @ManyToOne(() => Account, (account) => account.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Account;

  @OneToMany(() => Account, (account) => account.parent)
  children: Account[];

  @Column('simple-array', { name: 'group_ids', nullable: true })
  groupIds: number[];

  @Column({ name: 'unit_id', nullable: true })
  unitId: number;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
