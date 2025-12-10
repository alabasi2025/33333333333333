import { Module } from '@nestjs/common';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { AccountsModule } from './accounts/accounts.module';
import { AccountGroupsModule } from './account-groups/account-groups.module';

@Module({
  imports: [
    SuppliersModule,
    AccountsModule,
    AccountGroupsModule,
  ],
})
export class AppModule {}
