import {Test, TestingModule} from '@nestjs/testing';
import {PolicyholderController} from './policyholder.controller';

describe('PolicyholderController', () => {
  let controller: PolicyholderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PolicyholderController],
    }).compile();

    controller = module.get<PolicyholderController>(PolicyholderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
