import { Module, OnModuleInit } from '@nestjs/common';
import { PolicyholderService } from './policyholder.service';
import { PolicyholderController } from './policyholder.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PolicyholderEntity } from 'src/common/models/policyholder.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PolicyholderEntity])],
  providers: [PolicyholderService],
  controllers: [PolicyholderController],
})
export class PolicyholderModule implements OnModuleInit {
  constructor(private readonly policyholderService: PolicyholderService) { }
  async onModuleInit() {
    await this.createDefaultDataIfNotExists();
  }
  private async createDefaultDataIfNotExists() {
    // Check if there is any data in the database
    const policyholders = await this.policyholderService.list({});

    if (policyholders.data.length === 0) {
      // If there is no data, create the default data
      await this.policyholderService.create({ name: 'Root data' });
      // Add more default data if necessary
    }
  }
}
