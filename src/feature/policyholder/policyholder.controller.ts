import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  NotFoundException,
  UsePipes,
  Put,
  Param,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import {PolicyholderService} from './policyholder.service';
import {CreatePolicyholderDTO} from './dto/create-policyholder.dto';
import {ListPolicyholdersDTO} from './dto/list-policyholders.dto';
import {PolicyholderEntity} from '../../common/models/policyholder.entity';
import {PolicyholderPipe} from './pipe/policyholder.pipe';
import {UpdatePolicyholderDTO} from './dto/update-policyholder.dto';

@Controller('policyholders')
export class PolicyholderController {
  constructor(private readonly policyholderService: PolicyholderService) {}

  @Post()
  async create(
    @Body() createPolicyholderDTO: CreatePolicyholderDTO,
  ): Promise<PolicyholderEntity> {
    const newPolicyholder = await this.policyholderService.create(
      createPolicyholderDTO,
    );

    if (!newPolicyholder) {
      throw new NotFoundException('Failed to create policyholder.');
    }

    return newPolicyholder;
  }

  @Get()
  @UsePipes(PolicyholderPipe)
  async list(@Query() listPolicyholdersDTO: ListPolicyholdersDTO) {
    const {data, totalPages, totalItems} = await this.policyholderService.list(
      listPolicyholdersDTO,
    );

    return {
      data,
      totalPages,
      totalItems,
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePolicyholderDTO: UpdatePolicyholderDTO,
  ): Promise<PolicyholderEntity> {
    return this.policyholderService.update(id, updatePolicyholderDTO);
  }

  @Delete(':id')
  async deletePolicyholder(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.policyholderService.deletePolicyholder(id);
  }

  @Delete('batch')
  async deletePolicyholders(@Body() ids: number[]): Promise<void> {
    await this.policyholderService.deletePolicyholders(ids);
  }
  @Get(':id/descendants/:depth')
  async getDescendants(
    @Param('id', ParseIntPipe) id: number,
    @Param('depth', ParseIntPipe) depth: number,
  ) {
    return await this.policyholderService.getDescendants(id, depth);
  }
}
