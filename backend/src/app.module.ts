import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { AccountsModule } from './accounts/accounts.module';
import { AccountGroupsModule } from './account-groups/account-groups.module';
import { Account } from './accounts/account.entity';
import { AccountGroup } from './account-groups/account-group.entity';
import { Supplier } from './suppliers/supplier.entity';
import { Company } from './companies/company.entity';
import { Unit } from './units/unit.entity';
import { Branch } from './branches/branch.entity';
import { CompaniesModule } from './companies/companies.module';
import { UnitsModule } from './units/units.module';
import { BranchesModule } from './branches/branches.module';
import { CashBoxesModule } from './cash-boxes/cash-boxes.module';
import { CashBox } from './cash-boxes/cash-box.entity';
import { CashTransaction } from './cash-boxes/cash-transaction.entity';
import { BanksModule } from './banks/banks.module';
import { Bank } from './banks/bank.entity';
import { VouchersModule } from './vouchers/vouchers.module';
import { Voucher } from './vouchers/voucher.entity';
import { JournalEntriesModule } from './journal-entries/journal-entries.module';
import { JournalEntry } from './journal-entries/journal-entry.entity';
import { JournalEntryLine } from './journal-entries/journal-entry-line.entity';
import { ReportsModule } from './reports/reports.module';
import { WarehousesModule } from './warehouses/warehouses.module';
import { Warehouse } from './warehouses/warehouse.entity';
import { Item } from './warehouses/item.entity';
import { StockMovement } from './warehouses/stock-movement.entity';
import { StockBalance } from './warehouses/stock-balance.entity';
import { WarehouseGroup } from './warehouses/warehouse-group.entity';
import { StockTransaction } from './warehouses/stock-transaction.entity';
import { StockTransactionItem } from './warehouses/stock-transaction-item.entity';
import { Supplier as WarehouseSupplier } from './warehouses/supplier.entity';
import { SupplierGroup } from './warehouses/supplier-group.entity';
import { PaymentVouchersModule } from './payment-vouchers/payment-vouchers.module';
import { ReceiptVouchersModule } from './receipt-vouchers/receipt-vouchers.module';
import { PaymentVoucher } from './payment-vouchers/payment-voucher.entity';
import { ReceiptVoucher } from './receipt-vouchers/receipt-voucher.entity';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'semop_user',
      password: 'Acc@2025#Secure',
      database: 'semop_db',
      entities: [Account, AccountGroup, Supplier, Company, Unit, Branch, CashBox, CashTransaction, Bank, Voucher, JournalEntry, JournalEntryLine, Warehouse, Item, StockMovement, StockBalance, WarehouseGroup, StockTransaction, StockTransactionItem, WarehouseSupplier, SupplierGroup, PaymentVoucher, ReceiptVoucher],
      synchronize: false, // Disabled to avoid permission issues
      logging: false,
    }),
    SuppliersModule,
    AccountsModule,
    AccountGroupsModule,
    CompaniesModule,
    UnitsModule,
    BranchesModule,
    CashBoxesModule,
    BanksModule,
    VouchersModule,
    JournalEntriesModule,
    ReportsModule,
    WarehousesModule,
    PaymentVouchersModule,
    ReceiptVouchersModule,
    AuthModule,
  ],
})
export class AppModule {}
