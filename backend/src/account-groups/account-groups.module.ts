import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountGroupsController } from './account-groups.controller';
import { AccountGroupsService } from './account-groups.service';
import { AccountGroup } from './account-group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AccountGroup])],
  controllers: [AccountGroupsController],
  providers: [AccountGroupsService],
  exports: [AccountGroupsService]
})
export class AccountGroupsModule {}
