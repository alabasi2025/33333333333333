import { Module } from '@nestjs/common';
import { SuppliersModule } from './modules/suppliers/suppliers.module';

@Module({
  imports: [
    SuppliersModule,
  ],
})
export class AppModule {}
