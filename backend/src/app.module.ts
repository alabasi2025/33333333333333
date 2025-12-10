import { Module } from '@nestjs/common';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { AccountsModule } from './accounts/accounts.module';

@Module({
  imports: [
    SuppliersModule,
    AccountsModule,
  ],
})
export class AppModule {}
