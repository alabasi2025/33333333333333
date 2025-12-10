import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { AccountsModule } from './accounts/accounts.module';
import { AccountGroupsModule } from './account-groups/account-groups.module';
import { Account } from './accounts/account.entity';
import { AccountGroup } from './account-groups/account-group.entity';
import { Supplier } from './suppliers/supplier.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'accounting_user',
      password: 'Acc@2025#Secure',
      database: 'accounting_system',
      entities: [Account, AccountGroup, Supplier],
      synchronize: true, // Auto-create tables (only for development)
      logging: false,
    }),
    SuppliersModule,
    AccountsModule,
    AccountGroupsModule,
  ],
})
export class AppModule {}
